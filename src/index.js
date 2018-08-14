import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';

const TIME_REGEX_A = /(?:(\d+)\s*(?:hours?|h)(?![a-z]))?\s*(?:(\d+)\s*(?:minutes?|m)(?![a-z]))?\s*(?:(\d+)\s*(?:seconds?|s)(?![a-z]))?/i;
const TIME_REGEX_B = /^(?:(\d+):)?(\d+):(\d+)$/;

const MINUTES_ERROR = 'When you use minutes and seconds, minutes should be less than 60.';
const SECONDS_ERROR = 'When you use minutes and seconds, seconds should be less than 60.';
const SYNTAX_ERROR = 'You used the incorrect syntax.';

const AUDIO_PATH = process.env.PUBLIC_URL + '/alarm.mp3'

function calcSeconds(hours, minutes, seconds) {
  if (!hours) {
    hours = 0;
  }
  if (!minutes) {
    minutes = 0;
  }
  if (!seconds) {
    seconds = 0;
  }

  return hours * 3600 + minutes * 60 + seconds;
}

function parseInputTime(timeValue) {
  if (!timeValue) {
    return null;
  }
  let res = TIME_REGEX_B.exec(timeValue);
  if (!res || !res[0]) {
    res = TIME_REGEX_A.exec(timeValue);
  }
  if (!res || !res[0]) {
    return {error: SYNTAX_ERROR};
  }

  let hours = parseInt(res[1], 10);
  let minutes = parseInt(res[2], 10);
  let seconds = parseInt(res[3], 10);
  if (!isNaN(seconds) && minutes && minutes > 59) {
    return {error: MINUTES_ERROR};
  } 
  if (!isNaN(minutes) && seconds && seconds > 59) {
    return {error: SECONDS_ERROR};
  }

  return {seconds: calcSeconds(hours, minutes, seconds)};
}

class TimeOutput extends React.Component {
  constructor(props) {
    super(props);
    this.sound = new Audio(AUDIO_PATH);
    this.state = {
      isPaused: false,
      seconds: props.value,
    };

    this.handlePause = this.handlePause.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    if (this.state.isPaused) {
      return;
    }
    this.setState({
      seconds: this.state.seconds - 1
    });
    if (this.state.seconds === 0) {
      clearInterval(this.timerID);
      this.sound.loop = true;
      this.sound.play();
    }
  }

  parseTime() {
    const seconds = this.state.seconds % 60;
    const remMin = Math.floor(this.state.seconds / 60)
    const minutes = remMin % 60;
    const hours = Math.floor(remMin / 60);

    return `${hours}h ${minutes}m ${seconds}s`; 
    // TODO: don't show hours/minutes if its value is 0, 
  }

  handlePause() {
    this.setState({
      isPaused: !this.state.isPaused,
    });
  }

  handleReset() {
    this.sound.pause();
    this.props.onReset();
    this.setState({
      isPaused: false,
    });
  }

  render() {
    const time = this.parseTime();
    return (
      <div>
        <div className="time-text pb-3"> {time} </div>
        <button 
          onClick={this.handlePause}
          className="btn btn-lg btn-outline-success mx-2"
          disabled={this.state.seconds === 0}
        > 
          {this.state.isPaused? 'Continue' : 'Pause'} 
        </button>
        <button 
          onClick={this.handleReset}
          className="btn btn-lg btn-outline-danger mx-2"
        > Reset </button>
      </div>
    );
  }
}

class TimeInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.props.onValueChange(event.target.value);
  }

  handleSubmit(event) {
    event.preventDefault();
    if(!this.props.value) {
      return;
    }
    let parsed = parseInputTime(this.props.value);
    if (parsed.error) {
      alert(parsed.error); // TODO: show and error.
      return
    }
    this.props.onButtonPressed(parsed.seconds);
  }

  render() {
    return (
      <form 
        onSubmit={this.handleSubmit}
        className="form-input"
      >
        <input 
          type="text" placeholder="Time..." 
          value={this.props.value}
          onChange={this.handleChange}
          className="form-control form-control-lg text-center"
        />
        <input 
          type="submit" value="Start" 
          className="btn btn-lg btn-block btn-outline-primary my-2"
        />
      </form>
    );
  }
}

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      started: false, 
      rawValue: '',
      parsedValue: 0
    };

    this.handleStart = this.handleStart.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  handleStart(parsed) {
    this.setState({ 
      started: true,
      parsedValue: parsed
    });
  }

  handleStop() {
    this.setState({ started: false });
  }

  handleValueChange(value) {
    this.setState({ rawValue: value });
  }

  render() {
    return (
      <div className="text-center">
        <h1 className="display-3 font-weight-light text-secondary"> Timer </h1>
        {this.state.started ? (
          <TimeOutput 
            onReset={this.handleStop}
            value={this.state.parsedValue}
          /> 
        ) : (
          <TimeInput 
            onButtonPressed={this.handleStart}
            onValueChange={this.handleValueChange}
            value={this.state.rawValue}
          />
        )}
      </div>
    );
  }
}

ReactDOM.render(
  <Timer />,
  document.getElementById('root')
);
