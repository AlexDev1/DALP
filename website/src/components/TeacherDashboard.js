import React, { Component } from "react";
import NavBar from "./NavBar";
import "./TeacherDashboard.css";
import Video from "./Video";
import Peer from "peerjs";

export class TeacherDashboard extends Component {
  state = {
    stream: null,
    streaming: false,
    view: "activity",
    joineeList: [
      "Rahul",
      "Naman",
      "Suresh",
      "Raj",
      "Rahul",
      "Naman",
      "Suresh",
      "Raj",
      "Rahul",
      "Naman",
      "Suresh",
      "Raj",
      "Rahul",
      "Naman",
      "Suresh",
      "Raj",
      "Rahul",
      "Naman",
      "Suresh",
      "Raj"
    ],
    conn: null
  };

  componentDidMount = () => {
    //Initialising the peer
    const peer = new Peer(this.props.TeacherState.courseId, {
      host: "localhost",
      port: 8080,
      path: "/myapp"
    });
    console.log(this.props.TeacherState.courseId);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        console.log("Teacher Streaming successfully.");
        //Setting teacher's video
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
      //Sending the stream back
      call.answer(this.state.stream);
    });
  };

  onStreamBtnClick = () => {
    if (this.state.streaming) {
      this.setState({ streaming: false });
    } else {
      console.log("sending data");
      this.state.conn.send("start");
      this.setState({ streaming: true });
    }
  };

  getAllNames = () => {
    return this.state.joineeList.map(name => {
      return <div>{name}</div>;
    });
  };

  // TODO: redirect to home page if not authenticated
  render() {
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
                  {this.state.streaming
                    ? "  Stop Streaming"
                    : "Start Streaming"}
                </button>
              </div>
            </div>
            <div className="col-md-3">
              <div className="classroom-title mb-2">
                <h3>Quiz</h3>
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
                  <h5 class="card-title">
                    {this.props.TeacherState.quizTitle}
                  </h5>
                  <p class="card-text">
                    No. of questions: {this.props.TeacherState.quiz.length}
                  </p>
                  <button className="btn btn-outline-primary">
                    Launch Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TeacherDashboard;
