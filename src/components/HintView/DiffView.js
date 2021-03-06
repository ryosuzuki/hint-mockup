import React, { Component } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/python/python'
import Slider from 'rc-slider'
import Tooltip from 'rc-tooltip'
import Datastore from 'nedb'


class DiffView extends Component {
  constructor(props) {
    super(props)
    window.diffView = this
  }

  componentDidMount() {
    this.cm = this.refs.editor.getCodeMirror()
  }

  generateDiff(id) {
    setTimeout(() => {
      console.log('update')
      for (let line of this.props.removed) {
        this.cm.addLineClass(line, '', 'removed')
      }
      for (let line of this.props.added) {
        this.cm.addLineClass(line, '', 'added')
      }
    }, 50)
  }

  onClick(id) {
    window.app.setCurrent(id)
  }

  render() {
    return (
      <div>
        <h2>{ this.props.relatedItems.length } similar results (based on test)</h2>
        { _.sortBy(this.props.relatedItems, 'id').map((item) => {
          return (
            <a className="ui label" onClick={ this.onClick.bind(this, item.id) } key={ item.id }>
              { item.id }
            </a>
          )
        }) }
        <h2>Code</h2>
        <CodeMirror
          value={ this.props.code }
          ref="editor"
          options={ this.props.options }
        />
        <br />
        <h2>Failed Test Result</h2>
        <div className="markdown">
          <pre><code>{ this.props.log }</code></pre>
        </div>
        <br />
        <h2>Transformation Rule</h2>
        <div className="markdown">
          <pre style={{ whiteSpace: 'pre-wrap' }}><code>{ this.props.rule }</code></pre>
        </div>
      </div>
    )
  }
}

export default DiffView

