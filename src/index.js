import React from 'react';
import ReactDOM from 'react-dom';

class TimeOutput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPaused: false,
    };

    this.handlePause = this.handlePause.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  handlePause() {
    this.setState({
      isPaused: !this.state.isPaused,
    });
  }

  handleReset() {
    this.props.handleStop();
    this.setState({
      isPaused: false,
    });
  }


  render() {
    return (
      <div>
        <div> 00:00:00 </div>
        <button onClick={this.handlePause}> 
          {this.state.isPaused? 'Continue' : 'Pause'} 
        </button>
        <button onClick={this.handleReset}> Reset </button>
      </div>
    );
  }
}

class TimeInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      value: event.target.value,
    });
  }
  
  handleSubmit(event) {
    // TODO: do something with event.target.value
    this.props.handleStart();
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input 
          type="text" placeholder="Time..." 
          value={this.state.value}
          onChange={this.handleChange}
        />
        <input type="submit" value="Start" />
      </form>
    );
  }
}

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      started: false, 
    };

    this.handleStart = this.handleStart.bind(this);
    this.handleStop = this.handleStop.bind(this);
  }

  handleStart() {
    this.setState({
      started: true,
    });
  }

  handleStop() {
    this.setState({
      started: false,
    });
  }

  render() {
    return (
      <div>
        <h1> Timer </h1>
        {this.state.started ? (
          <TimeOutput handleStop={this.handleStop}/> 
        ) : (
          <TimeInput handleStart={this.handleStart}/>
        )}
      </div>
    );
  }
}

ReactDOM.render(
  <Timer />,
  document.getElementById('root')
);
