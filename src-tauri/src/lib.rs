//! Desktop-KI-Brücke: lokale Ollama-Verbindung und optional OpenAI.
//! API-Keys bleiben im Prozess oder in einer privaten .env-Datei.
use serde_json::{json,Value};
use std::{env,fs,time::Duration};
use tauri::Manager;

// Lade die Konfiguration ausschließlich im nativen Backend.
fn setting(app:&tauri::AppHandle,key:&str)->Option<String>{
  if let Ok(v)=env::var(key){if !v.trim().is_empty(){return Some(v)}}
  let mut paths=Vec::new();
  if let Ok(dir)=app.path().app_config_dir(){paths.push(dir.join(".env"));}
  #[cfg(debug_assertions)]
  paths.push(std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../.env"));
  for path in paths{if let Ok(raw)=fs::read_to_string(path){for line in raw.lines(){
    if let Some((k,v))=line.trim().split_once("="){if k.trim()==key{
      let val=v.trim().trim_matches('"').trim_matches('\'').to_string();
      if !val.is_empty(){return Some(val)}
    }}
  }}}
  None
}
/// URL prüfen statt nur einen String-Präfix zu vergleichen.
/// Dadurch sind manipulierte Adressen wie localhost:11434@fremd.example gesperrt.
fn validated_ollama_base(raw:&str)->Result<String,String>{
  let url=reqwest::Url::parse(raw).map_err(|_|"Ungültige Ollama-Adresse.".to_string())?;
  let host=url.host_str().unwrap_or("");
  let local=host.eq_ignore_ascii_case("localhost")||host=="127.0.0.1";
  if url.scheme()!="http"||!local||!url.username().is_empty()||
      url.password().is_some()||url.port().is_none()||
      url.path()!="/"||url.query().is_some()||url.fragment().is_some(){
    return Err("Ollama darf ausschließlich unter http://localhost:PORT oder http://127.0.0.1:PORT laufen.".into());
  }
  Ok(url.as_str().trim_end_matches('/').to_string())
}
fn client(seconds:u64)->Result<reqwest::Client,String>{
  reqwest::Client::builder().timeout(Duration::from_secs(seconds)).build().map_err(|e|e.to_string())
}
async fn model(base:&str,preferred:&str)->Result<Option<String>,String>{
  let response:Value=client(5)?.get(format!("{base}/api/tags")).send().await.map_err(|_|"Ollama nicht erreichbar. Bitte starten.".to_string())?
    .error_for_status().map_err(|e|e.to_string())?.json().await.map_err(|e|e.to_string())?;
  let names:Vec<String>=response["models"].as_array().into_iter().flatten()
    .filter_map(|v|v["name"].as_str().or_else(||v["model"].as_str()))
    .map(str::to_owned).collect();
  Ok(names.iter().find(|v|v.as_str()==preferred)
    .or_else(||names.iter().find(|v|v.starts_with(preferred.split(":").next().unwrap_or(""))))
    .or_else(||names.first()).cloned())
}
// JSON aus der Antwort lesen; Markdown-Codeblöcke werden toleriert.
fn decode(text:&str)->Result<Value,String>{
  if let Ok(v)=serde_json::from_str(text.trim()){return Ok(v)}
  let a=text.find("{").ok_or("Keine gültige JSON-Antwort.")?;
  let b=text.rfind("}").ok_or("Keine gültige JSON-Antwort.")?;
  serde_json::from_str(&text[a..=b]).map_err(|_|"Die KI lieferte kein gültiges JSON.".into())
}
async fn ask(app:&tauri::AppHandle,provider:&str,system:&str,user:&str)->Result<Value,String>{
  if provider=="openai"{
    let key=setting(app,"OPENAI_API_KEY").ok_or("OpenAI nicht eingerichtet. Nutze Ollama oder richte den Key lokal ein.")?;
    let name=setting(app,"OPENAI_MODEL").unwrap_or("gpt-4.1-mini".into());
    let data:Value=client(180)?.post("https://api.openai.com/v1/responses").bearer_auth(key)
      .json(&json!({"model":name,"instructions":system,"input":user}))
      .send().await.map_err(|e|e.to_string())?.error_for_status().map_err(|e|e.to_string())?
      .json().await.map_err(|e|e.to_string())?;
    let texts:Vec<&str>=data["output"].as_array().into_iter().flatten()
      .flat_map(|v|v["content"].as_array().into_iter().flatten())
      .filter_map(|v|v["text"].as_str()).collect();
    return decode(&texts.join("\n"));
  }
  if provider!="ollama"{return Err("Unbekannte KI-Auswahl.".into())}
  let configured=setting(app,"OLLAMA_URL").unwrap_or("http://127.0.0.1:11434".into());
  let base=validated_ollama_base(&configured)?;
  let preferred=setting(app,"OLLAMA_MODEL").unwrap_or("qwen3.5:4b".into());
  let name=model(base.trim_end_matches("/"),&preferred).await?
    .ok_or(format!("Kein Modell installiert. Bitte ollama pull {preferred} ausführen."))?;
  let data:Value=client(180)?.post(format!("{}/api/chat",base.trim_end_matches("/")))
    .json(&json!({"model":name,"stream":false,"format":"json",
       "messages":[{"role":"system","content":system},{"role":"user","content":user}],
       "options":{"temperature":0.2}}))
    .send().await.map_err(|e|e.to_string())?.error_for_status().map_err(|e|e.to_string())?
    .json().await.map_err(|e|e.to_string())?;
  decode(data["message"]["content"].as_str().unwrap_or(""))
}

const GENERATE:&str=r#"Du bist IHK-Lerntrainer für Fachinformatiker Systemintegration.
Erzeuge ausschließlich zum angegebenen Thema passende Fragen anhand der Unterlagen.
Gib nur ein JSON-Objekt zurück:
{"analysis":{"topic":"...","subtopics":["..."],"keyTerms":["..."]},
"questions":[{"type":"choice|multichoice|text|truefalse|number|scenario",
"topic":"...","subtopic":"...","prompt":"...","answer":"...",
"options":[],"correctOptions":[],"aliases":[],"explanation":"...",
"steps":[],"points":1,"chunkId":"Abschnitt-ID","evidenceQuote":"wörtliches Zitat","difficulty":"mittel","learningObjective":"Lernziel"}]}
Nur die genannten ABSCHNITTE sind erlaubt. Für jede Frage MUSS chunkId einer angegebenen ABSCHNITT-ID entsprechen und evidenceQuote ein mindestens 22 Zeichen langes, wörtliches Zitat aus diesem Abschnitt sein. Ergänze difficulty (leicht|mittel|schwer) und learningObjective. Erfinde keine Zitate. Bevorzuge Qualität vor Menge."#;
// Eine zusätzliche Batch-Prüfung statt acht einzelner Modellaufrufe.
const REVIEW:&str=r#"Prüfe jede Frage anhand der Originalabschnitte fachlich streng.
Akzeptiere nur eindeutige Fragen mit belegbarer richtiger Musterlösung.
Lehne unbelegte Antworten, Dubletten und triviale Fragen ab.
Antworte ausschließlich mit JSON:
{"acceptedIndices":[0,2],"reason":"kurze Begründung"}
Die Liste enthält nullbasierte Indizes. Im Zweifel ablehnen."#;
const EVALUATE:&str=r#"Bewerte IHK-Lernantworten fair, ohne Rechtschreibfehler zu bestrafen.
Nutze die Musterlösung und Erklärung als Rahmen. Antworte ausschließlich in JSON:
{"rating":"correct|partial|wrong","score":0.0,"feedback":"...","modelAnswer":"..."}
correct ab 0.85, partial ab 0.4, sonst wrong; score zwischen 0 und 1."#;

/// Nur fachlich konsistente KI-Punktzahlen an die Lernstatistik durchlassen.
/// Fehler führen im Frontend zur Selbstkontrolle statt zu einem falschen Ergebnis.
fn checked_evaluation(result: Value) -> Result<Value, String> {
    let rating = result["rating"].as_str().ok_or("KI-Bewertung nicht eindeutig; Selbstkontrolle verwenden.")?;
    let score = result["score"].as_f64().ok_or("KI-Bewertung ohne gültige Punktzahl.")?;
    if !score.is_finite() || !(0.0..=1.0).contains(&score) {
        return Err("KI-Bewertung mit ungültiger Punktzahl.".into());
    }
    let consistent = match rating {
        "correct" => score >= 0.85,
        "partial" => (0.4..0.85).contains(&score),
        "wrong" => score < 0.4,
        _ => false
    };
    if !consistent { return Err("KI-Bewertung widersprüchlich; Selbstkontrolle verwenden.".into()) }
    Ok(result)
}

// Die einzige aus JavaScript aufrufbare native Funktion.
#[tauri::command]
async fn ai_request(app:tauri::AppHandle,endpoint:String,payload:Option<Value>)->Result<Value,String>{
  match endpoint.as_str(){
    "/api/ai/status"=>{
      let base=setting(&app,"OLLAMA_URL").unwrap_or("http://127.0.0.1:11434".into());
      let preferred=setting(&app,"OLLAMA_MODEL").unwrap_or("qwen3.5:4b".into());
      let local=match validated_ollama_base(&base){
        Ok(validated)=>model(&validated,&preferred).await,
        Err(error)=>Err(error)
      };
      let ollama=match local{
        Ok(v)=>json!({"reachable":true,"modelReady":v.is_some(),
          "activeModel":v.unwrap_or_default(),"preferredModel":preferred,
          "message":"Ollama erreichbar"}),
        Err(e)=>json!({"reachable":false,"modelReady":false,"preferredModel":preferred,"message":e})
      };
      Ok(json!({"ollama":ollama,"openai":{"available":setting(&app,"OPENAI_API_KEY").is_some(),
        "model":setting(&app,"OPENAI_MODEL").unwrap_or("gpt-4.1-mini".into())},
        "defaultProvider":"ollama"}))
    }
    "/api/ai/generate"=>{
      let data=payload.ok_or("Anfragedaten fehlen.")?;
      let subject=data["subject"].as_str().unwrap_or("").trim();
      let topic=data["topic"].as_str().unwrap_or("").trim();
      let context=data["context"].as_str().unwrap_or("").chars().take(30000).collect::<String>();
      if subject.is_empty() || topic.is_empty() || context.len()<80{
        return Err("Bitte Fach, Thema und passende Unterlagen auswählen.".into());
      }
      let n=data["count"].as_u64().unwrap_or(8).clamp(1,8);
      let user=format!("Fach: {subject}\nThema: {topic}\nAnzahl: {n}\nUnterlagen:\n{context}");
      let provider=data["provider"].as_str().unwrap_or("ollama");
      let mut result=ask(&app,provider,GENERATE,&user).await?;
      let candidates:Vec<Value>=result["questions"].as_array()
        .ok_or("Keine Lernfragen erstellt.")?.iter().take((n as usize).min(8)).cloned().collect();
      if candidates.is_empty(){return Err("Keine Lernfragen erzeugt.".into())}
      // Qualität vor Anzahl: zweiter lokaler Ollama-/opt-in OpenAI-Aufruf.
      let review_input=format!("Originalabschnitte:\n{context}\n\nKandidaten:\n{}",
        Value::Array(candidates.clone()));
      let review=ask(&app,provider,REVIEW,&review_input).await?;
      let approved=review["acceptedIndices"].as_array()
        .ok_or("Qualitätskontrolle lieferte keine gültige Freigabeliste.")?;
      let mut kept=Vec::new();
      for (index,item) in candidates.into_iter().enumerate(){
        if approved.iter().any(|v|v.as_u64()==Some(index as u64)){kept.push(item);}
      }
      if kept.is_empty(){return Err("Keine Frage hat die zweite Qualitätsprüfung bestanden.".into())}
      result["questions"]=Value::Array(kept);
      Ok(result)
    }
    "/api/ai/evaluate"=>{
      let data=payload.ok_or("Anfragedaten fehlen.")?;
      let q=data.get("question").ok_or("Frage fehlt.")?;
      let answer=data.get("answer").ok_or("Antwort fehlt.")?;
      let user=format!("Frage: {q}\nAntwort: {answer}");
      let result=ask(&app,data["provider"].as_str().unwrap_or("ollama"),EVALUATE,&user).await?;
      checked_evaluation(result)
    }
    _=>Err("Nicht erlaubter Desktop-Endpunkt.".into())
  }
}

// Tauri initialisiert das Fenster und die erlaubten Kommandos.
pub fn run(){
  tauri::Builder::default().invoke_handler(tauri::generate_handler![ai_request])
    .run(tauri::generate_context!()).expect("Desktop-App konnte nicht gestartet werden");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn only_local_ollama_urls_are_allowed() {
        for url in ["http://127.0.0.1:11434", "http://localhost:11434/"] {
            assert!(validated_ollama_base(url).is_ok(), "should accept {url}");
        }
        for url in ["https://localhost:11434", "http://localhost:11434@evil.invalid",
                    "http://127.0.0.1:11434@evil.invalid", "http://evil.invalid:11434",
                    "http://localhost:11434/path", "http://localhost:11434?x=1",
                    "file:///tmp/ollama", "http://localhost"] {
            assert!(validated_ollama_base(url).is_err(), "must reject {url}");
        }
    }
    #[test]
    fn accepts_consistent_grades() {
        for value in [json!({"rating":"correct","score":1.0}),
                      json!({"rating":"partial","score":0.5}),
                      json!({"rating":"wrong","score":0.0})] {
            assert!(checked_evaluation(value).is_ok());
        }
    }
    #[test]
    fn rejects_invalid_or_contradictory_grades() {
        for value in [json!({"rating":"wrong","score":0.99}),
                      json!({"rating":"correct","score":0.1}),
                      json!({"rating":"partial","score":null}),
                      json!({"rating":"unknown","score":0.5})] {
            assert!(checked_evaluation(value).is_err());
        }
    }
}
