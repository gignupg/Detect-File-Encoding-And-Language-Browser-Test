import languageEncoding from "detect-file-encoding-and-language";
import { directoryOpen } from 'browser-fs-access';

const minConfidence = 0.95;
let error = false;

export default function App() {
  function setError(file: any, fileInfo: any) {
    error = true;
    console.info('file:', file);
    console.info('fileInfo:', fileInfo);
  }

  async function inputHandler() {
    error = false;
    const files = await directoryOpen({recursive: true});

    for (const file of files) {
      const folderNameArr = file.directoryHandle?.name.split('_');
      const expectedLanguage = folderNameArr ? folderNameArr[0] : null;
      const expectedEncoding = folderNameArr ? folderNameArr[1] : null;

      const fileInfo = await languageEncoding(file)
        if (!expectedLanguage) {
          console.error("Expected language not found in folder name", file.directoryHandle?.name);
          setError(file, fileInfo);

        } else if (!expectedEncoding) {
          console.error("Expected encoding not found in folder name", file.directoryHandle?.name);
          setError(file, fileInfo);

        } else if (!fileInfo.confidence.encoding || fileInfo.confidence.encoding < minConfidence) {
          console.error("Encoding Confidence too low!", fileInfo.confidence.encoding);
          setError(file, fileInfo);

        } else if (!fileInfo.confidence.language || fileInfo.confidence.language < minConfidence) {
          console.error("Language Confidence too low!", fileInfo.confidence.language);
          setError(file, fileInfo);

        } else if (fileInfo.language !== expectedLanguage) {
          console.error(`Language mismatch! Expected ${expectedLanguage} but got ${fileInfo.language}`);
          setError(file, fileInfo);

        } else if (fileInfo.encoding !== expectedEncoding) {
          console.error(`Encoding mismatch! Expected ${expectedEncoding} but got ${fileInfo.encoding}`);
          setError(file, fileInfo);
        }
    }

    if (!error) {
      console.info("All tests passed!");
    }
  }

  return (
    <button className="btn waves-effect waves-light" onClick={inputHandler} type="submit" name="action">Test Folder
      <i className="material-icons left">cloud</i>
    </button>
  )
}