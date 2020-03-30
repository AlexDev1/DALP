import React, { Component } from "react";
import Peer from "peerjs";
import io from "socket.io-client";
import { Redirect } from "react-router-dom";

import NavBar from "./NavBar";
import "./TeacherDashboard.css";
import Video from "./Video";
export class TeacherDashboard extends Component {
  state = {
    img: "",
    stream: null,
    streaming: false,
    view: "activity",
    joineeList: [],
    conn: null,
    socket: null,
    socketSet: false
  };

  componentDidMount = () => {
    this.canvas = React.createRef();
    //Initialising the peer
    const peer = new Peer(this.props.TeacherState.courseId, {
      host: "localhost",
      port: 8080,
      path: "/myapp"
    });
    //Initialising the socket and setting the state to be used anywhere
    const socket = io(`http://localhost:8081`);
    this.setState({ socket, socketSet: true });
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        console.log("Teacher Streaming successfully.");
        //Setting teacher's video
        //IMPORTANT: DO NOT SET ANY STATE BEFORE THIS
        this.setState({ socketSet: false });
        this.setState({ stream });
      })
      .catch(err => {
        //If teacher hasn't given the permission
        //TODO:Error component
        console.log("Error accessing teacher's stream.", err);
      });
    //Asking the teacher to respond to the student call
    peer.on("call", call => {
      console.log("Student called the teacher !!");
      //Sending the stream back only is streaming
      if (this.state.streaming) call.answer(this.state.stream);
    });
  };
  //Join the room once the socket is set
  componentDidUpdate = () => {
    if (this.state.socketSet) {
      this.state.socket.emit("join-room", {
        room: this.props.TeacherState.courseId,
        username: this.props.TeacherState.name
      });
      console.log("Teacher joined the room");
    }
  };

  // Start streaming
  onStreamBtnClick = () => {
    this.setState({ streaming: true });
    // Ask recievers to class teacher
    this.state.socket.emit("s-call");
    // Start sending screenshots
    setInterval(this.sendScreenshot, 3000);
    // TODO: Allandhir implement transcript sending
  };

  // TODO: implement present students
  getAllNames = () => {
    return this.state.joineeList.map(name => {
      return <div>{name}</div>;
    });
  };

  getAudioStream = () => {
    return this.state.stream.getAudioTracks()[0];
  };

  sendScreenshot = async () => {
    let imgurl = await this.getScreenshot();
    console.log(imgurl);
    this.state.socket.emit("s-image", imgurl);
  };

  // TODO: Chandak screenshot
  getScreenshot = () => {
    return new Promise((resolve, reject) => {
      let mediaStreamTrack = this.state.stream.getVideoTracks()[0];
      // console.log(mediaStreamTrack.getSettings());
      let imageCapture = new ImageCapture(mediaStreamTrack);
      imageCapture.grabFrame().then(bitMap => {
        this.ctx = this.canvas.current.getContext("2d");
        this.ctx.imageSmoothingEnabled = true;
        // Brighten up the image
        this.ctx.filter = "brightness(150%)";
        // Draw frame on canvas
        this.ctx.drawImage(
          bitMap,
          0,
          0,
          this.canvas.current.width,
          this.canvas.current.height
        );
        let imgurl = this.canvas.current.toDataURL();
        resolve(imgurl);
      });
    });
  };

  onQuizSend = () => {
    console.log("Sending quiz");
    this.state.socket.emit("s-quiz", {
      quiz: this.props.TeacherState.quiz,
      title: this.props.TeacherState.quizTitle
    });
    this.state.socket.on("s-quiz-submit", data => {
      console.log(data);
    });
  };

  render() {
    if (!this.props.TeacherAuth) {
      return <Redirect to="/teacher"></Redirect>;
    }
    return (
      <div className="teacher-dashboard mb-3">
        <NavBar name={this.props.TeacherState.name} />
        <div className="container content">
          <div className="row">
            <div className="col-md">
              <div className="course-title mb-2">
                <h3 className="course-name">
                  {this.props.TeacherState.courseName}
                </h3>
                <span className="text-muted">
                  Course ID: {this.props.TeacherState.courseId}
                </span>
              </div>
              <Video src={this.state.stream} size="embed-responsive-16by9" />
              <div className="text-center mt-3">
                <button
                  className="btn btn-primary btn-md"
                  onClick={this.onStreamBtnClick}
                >
                  <span
                    className="spinner-grow spinner-grow-sm"
                    role="status"
                    aria-hidden="true"
                    style={{
                      display: this.state.streaming ? "inline-block" : "none"
                    }}
                  ></span>
                  {this.state.streaming ? "Stop" : "Start"} streaming
                </button>
              </div>
            </div>
            <div className="col-md-3">
              <div className="classroom-title mb-2">
                <h3>Classroom</h3>
                <span className="text-muted">
                  Strength: {this.state.joineeList.length}
                </span>
              </div>
              <div className="student-name">{this.getAllNames()}</div>
            </div>
          </div>
          <div className="row">
            <div className="col-md">
              <div className="course-title mb-2">
                <h3 className="course-name">Quizzes</h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    {this.props.TeacherState.quizTitle}
                  </h5>
                  <p className="card-text">
                    No. of questions:{" "}
                    {this.props.TeacherState.quiz === null
                      ? 0
                      : this.props.TeacherState.quiz.length}
                  </p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={this.onQuizSend}
                  >
                    Launch Quiz
                  </button>
                </div>
              </div>
            </div>

            <canvas ref={this.canvas} width={640} height={480}></canvas>
          </div>
        </div>
      </div>
    );
  }
}

export default TeacherDashboard;
