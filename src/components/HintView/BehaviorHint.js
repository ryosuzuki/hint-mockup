import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import _ from 'lodash'

class BehaviorHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tick: 0,
      expected: {},
      result: {},
      key: '',
    }
    window.behaviorHint = this
  }

  componentDidMount() {
    this.init()
  }

  init() {
    if (!this.refs.editor) return false
    this.cm = this.refs.editor.getCodeMirror()

    // this.cm.markText({ line: 4, ch: 4 }, { line: 4, ch: 9 }, { className: 'highlight' })
    /*
    let marker = document.createElement('div')
    marker.append($('.label')[0])
    this.cm.setGutterMarker(3, 'breakpoints', marker)
    */
  }


  playStep() {
    let interval = 100
    window.app.updateState({ stop: false })
    let timer = setInterval(() => {
      if (this.props.step >= this.props.traces.length || this.props.stop) {
        clearInterval(timer)
        window.app.updateState({ stop: false })
      } else {
        try {
          this.updateStep(this.props.step+1)
        } catch (err) {
          this.updateStep(this.props.step-1)
          window.app.updateState({ stop: true })
        }
      }
    }, interval)
  }

  updateStep(value) {
    let step = Math.floor(value)
    this.cm.setValue(this.props.beforeCode)

    let current = this.props.traces[step]
    /*
    if (current.error) {
      this.cm.addLineClass(current.line-1, '', 'highlight')
      window.app.updateState({ stop: true })
    } else {
      this.cm.addLineClass(current.line-1, '', 'current-line')
    }
    */

    const getLog = (output) => {
      let msg = ''
      for (let key of Object.keys(output)) {
        if (output[key] instanceof Object) {
          msg += key
          msg += '('
          msg += _.map(output[key]).join(', ')
          msg += ')'
        } else {
          if (key === '__return__') {
            msg += 'return'
          } else {
            msg += key
          }
          msg += ': '
          if (output[key]) msg += output[key]
        }
      }
      return msg
    }

    const getValue = (output) => {
      let val = ''
      for (let key of Object.keys(output)) {
        if (output[key] instanceof Object) {
        } else {
          if (output[key]) val += output[key]
        }
      }
      return val
    }

    window.current = current
    for (let line of Object.keys(current.outputs)) {
      let output = current.outputs[line]
      // output = JSON.stringify(output)
      let msg = getLog(output)

      let fixedOutput = current.fixedOutputs ? current.fixedOutputs[line] : null
      if (fixedOutput && !_.isEqual(output, fixedOutput)) {
        msg += ' should be '
        msg += getLog(fixedOutput)
      }

      let ch = this.props.beforeCode.split('\n')[line-1].length
      let space = ' '
      // for (let i = ch; i < 30; i++) {
      //   space += ' '
      // }
      msg = `${space} # ${msg}`
      this.cm.replaceRange(msg, { line: line-1, ch: ch }, { line: line-1, ch: Infinity })
    }

    let result = {}
    let expected = {}
    for (let key of Object.keys(this.props.beforeHistory)) {
      let history = this.props.beforeHistory[key]
      let tick = this.props.beforeTicks[key][step]
      if (!tick) tick = 0
      result[key] = history.slice(0, tick)
    }
    for (let key of Object.keys(this.props.afterHistory)) {
      let history = this.props.afterHistory[key]
      // let tick = this.props.afterTicks[key][step]
      let tick = this.props.beforeTicks[key][step]
      if (!tick) tick = 0
      expected[key] = history.slice(0, tick)
    }

    this.setState({ expected: expected, result: result })

    let code = this.cm.getValue()
    window.app.updateState({ step: step, currentCode: code })

    // this.cm.addLineClass(current.line-1, '', 'current-line')
    // let msg = document.createElement('div')
    // msg.className = 'inline-hint'
    // msg.append($('.arrow-border').clone()[0])
    // msg.append($('.arrow-up').clone()[0])
    // msg.append($('.dynamic-hint').clone()[0])
    // this.cm.addLineWidget(this.state.line-1, msg, { coverGutter: true })


  }




  render() {
    return (
      <div>
        <h1>Behavior Hint</h1>
        <div className="ui message">
          <div className="header">
            Behavior Hint
          </div>
          <p>{ '' }</p>

          <div className="play-area">
          <button className="ui basic button play-button" onClick={ this.playStep.bind(this) }>
            <i className="fa fa-play fa-fw"></i>
          </button>
          <Slider
            dots
            min={ 0 }
            max={ this.props.traces.length-1 }
            value={ this.props.step }
            onChange={ this.updateStep.bind(this) }
          />
          </div>
        </div>

        <div className="markdown">
          <pre className="dynamic-hint">
            { this.props.focusKeys.map((key, index) => {
              return (
                <div key={ key }>
                  <code>
                  o { key }: { this.state.expected[key] ? this.state.expected[key].join(' | ') : '' }
                  <br />
                  x { key }: { this.state.result[key] ? this.state.result[key].join(' | ') : '' }

                  { index !== this.props.focusKeys.length-1 ? (
                    <span><br /><br /></span>
                  ) : (
                    ''
                  ) }
                  </code>
                </div>
              )
            }) }
          </pre>
        </div>

        <h2>Code</h2>
        <CodeMirror
          value={ this.props.currentCode }
          ref="editor"
          options={ this.props.options }
        />

        <div style={{ display: 'none' }}>
          <div className="ui blue label call-label">
            10 calls
          </div>
          <div className="arrow-up"></div>
          <div className="arrow-border"></div>
          <pre className="dynamic-hint">
          </pre>
        </div>

        <div className="markdown">
          <pre>
            { _.intersection(Object.keys(this.props.beforeHistory), Object.keys(this.props.afterHistory)).map((key) => {
              return (
                <div key={ key }>
                  <code>
                    { key }
                  </code>
                  <br />
                  <code>
                    - Expected: { this.state.expected[key] ? this.state.expected[key].join(' | ') : '' }
                  </code>
                  <br />
                  <code>
                    - Result:   { this.state.result[key] ? this.state.result[key].join(' | ') : '' }
                  </code>
                  <br />
                  <br />
                </div>
              )
            }) }
          </pre>
        </div>

      </div>
    )
  }
}

export default BehaviorHint
