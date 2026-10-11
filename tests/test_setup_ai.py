import io
import json
import os
from pathlib import Path
import stat
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import setup_ai
import teacher_engine

class SetupTests(unittest.TestCase):
    def test_private_file_and_read(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);target=root/'.openai-api-key'
            setup_ai.write_private(target,'sk-test-placeholder\n')
            self.assertEqual(stat.S_IMODE(target.stat().st_mode),0o600)
            with patch.object(teacher_engine,'ROOT',root),patch.dict(os.environ,{},clear=True):
                self.assertEqual(teacher_engine.api_key(),'sk-test-placeholder')
                target.chmod(0o644)
                with self.assertRaises(ValueError):teacher_engine.api_key()
    def test_access_check_does_not_generate(self):
        requests=[]
        def fake(request,timeout):
            requests.append(request);return io.BytesIO(json.dumps({'id':setup_ai.MODEL}).encode())
        setup_ai.check_access('sk-test-placeholder',fake)
        self.assertEqual(len(requests),1)
        self.assertEqual(requests[0].get_method(),'GET')
        self.assertEqual(requests[0].full_url,'https://api.openai.com/v1/models/'+setup_ai.MODEL)
    def test_symlink_not_overwritten(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'original').write_text('original');(root/'link').symlink_to(root/'original')
            with self.assertRaises(ValueError):setup_ai.write_private(root/'link','changed')
            self.assertEqual((root/'original').read_text(),'original')

if __name__=='__main__':unittest.main()
