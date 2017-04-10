import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import Mousetrap from 'mousetrap'
import Highlight from 'react-highlight'

import ControlPanel from './ControlPanel'
import DiffView from './HintView/DiffView'
import HintView from './HintView/Index'
import MockupView from './HintMockup/Index'
import MixedHint from './MixedHint'
import InteractiveHint from './InteractiveHint'
import Stream from './Data/Stream'
import Record from './Data/Record'
import Tree from './Data/Tree'

import Datastore from 'nedb'
const db = new Datastore()

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    window.app = this
    window.db = db

    window.quizes = []
  }

  componentDidMount() {

    const href = window.location.href
    const params = {}
    href.replace(
      new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
      function( $0, $1, $2, $3 ){
        params[ $1 ] = $3;
      }
    )

    const types = ['accumulate', 'product', 'g', 'repeated']
    if (!params.type && params.id) {
      window.location.href = `/?type=accumulate&id=${params.id}`
      return false
    }
    if (!params.type || !params.id || !types.includes(params.type)) {
      window.location.href = `${window.location.pathname}?type=accumulate&id=0`
      return false
    }

    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/${params.type}.txt`
    })
    .then((txt) => {
      this.updateState({ description: txt })
    })

    $.ajax({
      method: 'GET',
      url: `${window.location.pathname}data/${params.type}.json`
    })
    .then((items) => {
      console.log('start')
      window.type = params.type

      $(`#type-links #${params.type}`).addClass('primary')
      const id = Number(params.id)
      this.updateState({ items: items })
      this.setCurrent(id)

      items = items.map((item) => {
        return {
          id: item.id,
          test: item.test,
          expected: item.expected,
          result: item.result
        }
      })
      db.insert(items, (err) => {
        console.log('finish')
        let item = items[id]
        db.find({ test: item.test, result: item.result }, function(err, items) {
          this.updateState({ relatedItems: items })
        }.bind(this))

      })
    })

    Mousetrap.bind('left', () => {
      this.setCurrent(this.props.id - 1)
    })
    Mousetrap.bind('right', () => {
      this.setCurrent(this.props.id + 1)
    })
  }


  setCurrent(id) {
    console.log('set current')
    let item = this.props.items[id]
    let stream = new Stream()
    stream.generate(item.beforeTraces, item.beforeCode, 'before')
    stream.generate(item.afterTraces, item.afterCode, 'after')
    stream.check()

    let record = new Record()
    record.generate(stream.beforeTraces, 'before')
    record.generate(stream.afterTraces, 'after')
    record.check()

    let state = Object.assign(item, {
      id: id,
      beforeTraces: stream.beforeTraces,
      afterTraces: stream.afterTraces,
      traces: stream.traces,
      currentCode: item.beforeCode,
      step: 0,
      stop: false,
      beforeHistory: record.beforeHistory,
      afterHistory: record.afterHistory,
      beforeTicks: record.beforeTicks,
      afterTicks: record.afterTicks,
      commonKeys: record.commonKeys,
      focusKeys: record.focusKeys,
      beforeEvents: record.beforeEvents,
      afterEvents: record.afterEvents,
    })
    this.updateState(state)
    window.history.pushState(null, null, `?type=${window.type}&id=${id}`)
    // window.diffView.generateDiff(id)
    setTimeout(() => {
      console.log('call init')
      window.interactiveHint.init()
      window.ladder.init()

      // window.locationHint.init()
      // window.transformationHint.init()
      // window.behaviorHint.init()
      // window.exampleHint.init()
      // window.scaffoldingHint.init()

    }, 500)

    db.find({ test: item.test, result: item.result }, function(err, items) {
      this.updateState({ relatedItems: items })
    }.bind(this))


  }

  updateState(state) {
    this.props.store.dispatch(actions.updateState(state))
  }

  render() {
    const options = {
      mode: 'python',
      theme: 'base16-light',
      lineNumbers: true
    }

    return (
      <div>
        <div className="ui two column centered grid" style={{ marginTop: '20px' }}>
          {/*
          <div className="fifteen wide column">
            <h1 id="top-title" className="ui center aligned huge header">
              Exploring the Design Space of Automated Hints -
              <a href="https://github.com/ryosuzuki/hint-mockup/" target="blank">
                <i className="fa fa-fw fa-github-alt"></i> GitHub
              </a>
            </h1>
          </div>
          */}
          <div id="type-links" className="six wide column">
            <a id="g" className="ui basic button" href="?type=g&id=0">g</a>
            <a id="product" className="ui basic button" href="?type=product&id=0">product</a>
            <a id="accumulate" className="ui basic button" href="?type=accumulate&id=0">accumulate</a>
            <a id="repeated" className="ui basic button" href="?type=repeated&id=0">repeated</a>
          </div>
          <div id="control-panel" className="eight wide column">
            <ControlPanel
              id={ this.props.id }
              items={ this.props.items }
            />
          </div>
        </div>
        <div className="ui two column centered grid">
          <div id="mixed-hint" className="fifteen wide column">
            <h1 className="title">Problem</h1>
            <div id="problem-description" className="ui message hint-message">
              <Highlight className="python">
                { this.props.description }
              </Highlight>
            </div>

            <h1 className="title">Task</h1>
            <InteractiveHint
              options={ options }
              id={ this.props.id }
              description={ this.props.description }
              code={ this.props.code }
              before={ this.props.before }
              after={ this.props.after }

              test={ this.props.test }
              expected={ this.props.expected }
              result={ this.props.result }
              log={ this.props.log }

              step={ this.props.step }
              stop={ this.props.stop }

              currentCode={ this.props.currentCode }
              beforeCode={ this.props.beforeCode }
              afterCode={ this.props.afterCode }
              added={ this.props.added }
              removed={ this.props.removed }
              addedLine={ this.props.addedLine }
              removedLine={ this.props.removedLine }
              diffs={ this.props.diffs }

              traces={ this.props.traces }
              beforeTraces={ this.props.beforeTraces }
              afterTraces={ this.props.afterTraces }

              beforeHistory={ this.props.beforeHistory}
              afterHistory={ this.props.afterHistory}

              beforeEvents={ this.props.beforeEvents}
              afterEvents={ this.props.afterEvents}

              beforeTicks={ this.props.beforeTicks}
              afterTicks={ this.props.afterTicks}

              beforeAst={ this.props.beforeAst}
              afterAst={ this.props.afterAst}

              commonKeys={ this.props.commonKeys}
              focusKeys={ this.props.focusKeys}
            />
          </div>
        </div>
        {/*
        <div className="ui two column centered grid">
          <div id="mixed-hint" className="ten wide column">
            <h1 className="title">Student</h1>
            <MixedHint
              options={ options }
              id={ this.props.id }
              code={ this.props.code }
              before={ this.props.before }
              after={ this.props.after }

              test={ this.props.test }
              expected={ this.props.expected }
              result={ this.props.result }
              log={ this.props.log }

              step={ this.props.step }
              stop={ this.props.stop }

              beforeCode={ this.props.beforeCode }
              afterCode={ this.props.afterCode }
              added={ this.props.added }
              removed={ this.props.removed }
              addedLine={ this.props.addedLine }
              removedLine={ this.props.removedLine }
              diffs={ this.props.diffs }

              traces={ this.props.traces }
              beforeTraces={ this.props.beforeTraces }
              afterTraces={ this.props.afterTraces }

              beforeHistory={ this.props.beforeHistory}
              afterHistory={ this.props.afterHistory}

              beforeEvents={ this.props.beforeEvents}
              afterEvents={ this.props.afterEvents}

              beforeTicks={ this.props.beforeTicks}
              afterTicks={ this.props.afterTicks}

              beforeAst={ this.props.beforeAst}
              afterAst={ this.props.afterAst}

              commonKeys={ this.props.commonKeys}
              focusKeys={ this.props.focusKeys}
            />
          </div>
        </div>
        <div className="ui two column centered grid">
          <div id="diff-view" className="six wide column">
            <h1 className="title">Teacher</h1>
            <DiffView
              options={ options }
              id={ this.props.id }
              code={ this.props.code }
              added={ this.props.added }
              removed={ this.props.removed }
              log={ this.props.log }
              rule={ this.props.rule }
              relatedItems={ this.props.relatedItems }
            />
          </div>
          <div id="hint-view" className="ten wide column">
            <h1 className="title">Student</h1>
            <HintView
              options={ options }
              id={ this.props.id }
              code={ this.props.code }
              before={ this.props.before }
              after={ this.props.after }
              traces={ this.props.traces }
              currentCode={ this.props.currentCode }
              step={ this.props.step }
              stop={ this.props.stop }
              beforeCode={ this.props.beforeCode }
              afterCode={ this.props.afterCode }
              beforeTraces={ this.props.beforeTraces }
              afterTraces={ this.props.afterTraces }
              added={ this.props.added }
              removed={ this.props.removed }
              addedLine={ this.props.addedLine }
              removedLine={ this.props.removedLine }
              diffs={ this.props.diffs }
              log={ this.props.log }
              test={ this.props.test }
              beforeHistory={ this.props.beforeHistory}
              afterHistory={ this.props.afterHistory}
              beforeTicks={ this.props.beforeTicks}
              afterTicks={ this.props.afterTicks}
              commonKeys={ this.props.commonKeys}
              focusKeys={ this.props.focusKeys}
            />
          </div>
        </div>
        <div className="ui two column centered grid">
          <div id="mockup-view" className="nine wide column">
            <MockupView
              options={ options }
            />
          </div>
        </div>
        */}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return state
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
