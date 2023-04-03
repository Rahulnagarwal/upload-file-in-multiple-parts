import axios from "axios";
import React, { useEffect, useState } from 'react';
import { Form, Jumbotron, ProgressBar } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

const chunkSize = 1048576 * 3;//its 3MB, increase the number measure in mb

function App() {
  const [showProgress, setShowProgress] = useState(false)
  const [counter, setCounter] = useState(1)
  const [fileToBeUpload, setFileToBeUpload] = useState({})
  const [beginingOfTheChunk, setBeginingOfTheChunk] = useState(0)
  const [endOfTheChunk, setEndOfTheChunk] = useState(chunkSize)
  const [progress, setProgress] = useState(0)
  const [fileGuid, setFileGuid] = useState("")
  const [fileSize, setFileSize] = useState(0)
  const [chunkCount, setChunkCount] = useState(0)
  const [fileName, setFileName] = useState("")
  const progressInstance = <ProgressBar animated now={progress} label={`${progress.toFixed(3)}%`} />;

  useEffect(() => {
    if (fileSize > 0) {
      fileUpload();
    }
    console.log(counter);
  }, [fileToBeUpload, progress])

  const getFileContext = (e) => {
    resetChunkProperties();
    const _file = e.target.files[0];
    setFileSize(_file.size)
    setFileName(_file?.name)
    const _totalCount = _file.size % chunkSize == 0 ? _file.size / chunkSize : Math.floor(_file.size / chunkSize) + 1; // Total count of chunks will have been upload to finish the file
    setChunkCount(_totalCount)

    setFileToBeUpload(_file)
    const _fileID = uuidv4() + "." + _file.name.split('.').pop();
    setFileGuid(_fileID)
  }


  const fileUpload = () => {
    setCounter(counter + 1);
    if (counter <= chunkCount) {
      var chunk = fileToBeUpload.slice(beginingOfTheChunk, endOfTheChunk);
      uploadChunk(chunk)
    }
  }

  const uploadChunk = async (chunk) => {
    var formData = new FormData();
    formData.append('qqpartindex', counter);
    formData.append('qqpartbyteoffset', counter * chunk?.size);
    formData.append('qqchunksize', chunk?.size);
    formData.append('qqfilename', fileName);
    formData.append('qqtotalfilesize', fileSize);
    formData.append('qqtotalparts', chunkCount);
    formData.append('qquuid', fileGuid);
    formData.append('qqfile', chunk);
    try {
      const response = await axios.post("https://dev.api.lms.skunktest.work/v1/course_file_versions", formData, {
        params: {
          apiToken: "crUuh1NjX7DPVdo",
          courseId: 1397,
          userId: 1530,
          companyId: 1,
        },
        headers: {
          Authorization: "Bearer crUuh1NjX7DPVdo",
        },
      });
      const data = response.data;
      if (data.success) {
        setBeginingOfTheChunk(endOfTheChunk);
        setEndOfTheChunk(endOfTheChunk + chunkSize);
        if (counter == chunkCount) {
          console.log('Process is complete, counter', counter)

          await uploadCompleted();
        } else {
          var percentage = (counter / chunkCount) * 100;
          setProgress(percentage);
        }
      } else {
        console.log('Error Occurred:', data.errorMessage)
      }

    } catch (error) {
      console.log('error', error)
    }
  }

  const uploadCompleted = async () => {
    var formData = new FormData();
    formData.append('qqfilename', fileName);
    formData.append('qqtotalfilesize', fileSize);
    formData.append('qqtotalparts', chunkCount);
    formData.append('qquuid', fileGuid);

    const response = await axios.post("https://dev.api.lms.skunktest.work/v1/course_file_versions?courseId=1397&done=true&apiToken=crUuh1NjX7DPVdo&userId=1530&companyId=1", formData, {
      params: {
        apiToken: "crUuh1NjX7DPVdo",
        done: true,
        courseId: 1397,
        userId: 1530,
        companyId: 1,
      },
    });

    const data = response.data;
    if (data.success) {
      alert("Uploading successful")
      setProgress(100);
    }
  }

  const resetChunkProperties = () => {
    setShowProgress(true)
    setProgress(0)
    setCounter(1)
    setBeginingOfTheChunk(0)
    setEndOfTheChunk(chunkSize)
  }

  return (
    <Jumbotron>
      <Form>
        <Form.Group>
          <Form.File id="exampleFormControlFile1" onChange={getFileContext} label="Example file input" />
        </Form.Group>
        <Form.Group style={{ display: showProgress ? "block" : "none" }}>
          {progressInstance}
        </Form.Group>
      </Form>
    </Jumbotron >
  );
}


export default App;