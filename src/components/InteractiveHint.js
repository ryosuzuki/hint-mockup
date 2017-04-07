import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import _ from 'lodash'
import Highlight from 'react-highlight'
import Quiz from './InteractiveHint/Quiz'
import Ladder from './InteractiveHint/Ladder'
import Answer from './InteractiveHint/Answer'
import Play from './InteractiveHint/Play'

class InteractiveHint extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 0,
      loops: [],
      text: '',
      events: [],
    }
    window.interactiveHint = this
  }

  componentDidMount() {
    this.init()
  }

  init() {
    if (!this.refs.editor) return false
    this.cm = this.refs.editor.getCodeMirror()
    window.cm = this.cm
    // let msg = document.createElement('div')
    // this.cm.addLineWidget(3, msg, { coverGutter: true })
  }

  render() {
    return (
      <div>
        <h1>Interactive Hint</h1>

        <div className="ui message hint-message">
          <div className="ui three column grid">
            <div className="five wide column">
              <h2>Code</h2>
              <div id="hoge">
              <CodeMirror
                value={ this.props.currentCode }
                ref="editor"
                options={ this.props.options }
              />
              </div>
            </div>
            <div className="eleven wide column">
              <Ladder
                beforeHistory={ this.props.beforeHistory }
                afterHistory={ this.props.afterHistory }

                beforeEvents={ this.props.beforeEvents }
                afterEvents={ this.props.afterEvents }

                beforeAst={ this.props.beforeAst }
                afterAst={ this.props.afterAst }

                currentCode={ this.props.currentCode }
                beforeCode={ this.props.beforeCode }

                before={ this.props.before }

                focusKeys={ this.props.focusKeys }
                test={ this.props.test }
                expected={ this.props.expected }
                result={ this.props.result }
                root={ this }
              />

              {/*
              <Play
                traces={ this.props.traces }
                step={ this.props.step }
                beforeCode={ this.props.beforeCode }
                currentCode={ this.props.currentCode }
              />
              */}

            </div>
            <button className="ui basic button" onClick={ () => { $('.ladder').toggle() } }>Hide Hint</button>
          </div>
        </div>
        <button className="ui basic button" onClick={ () => { $('#answer').toggle() } }>Hide Answer</button>
        <br/>

        <Answer
          options={ this.props.options }
          id={ this.props.id }
          code={ this.props.code }
          before={ this.props.before }
          after={ this.props.after }

          added={ this.props.added }
          removed={ this.props.removed }

          beforeHistory={ this.props.beforeHistory }
          afterHistory={ this.props.afterHistory }
        />

          <div className="arrow-up"></div>
          <div className="arrow-border"></div>
          <pre className="dynamic-hint"></pre>

      </div>
    )
  }
}

export default InteractiveHint
