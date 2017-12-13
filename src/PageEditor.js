import React, { Component } from 'react';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createToolbarPlugin from 'draft-js-static-toolbar-plugin';
import createLinkPlugin from 'draft-js-anchor-plugin';

import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton
} from 'draft-js-buttons';

import './toolbarPlugin.css';
import './editorStyles.css';

class HeadlinesPicker extends Component {
  componentDidMount() {
    setTimeout(() => { window.addEventListener('click', this.onWindowClick); });
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
  }

  onWindowClick = () =>
    // Call `onOverrideContent` again with `undefined`
    // so the toolbar can show its regular content again.
    this.props.onOverrideContent(undefined);

  render() {
    const buttons = [HeadlineOneButton, HeadlineTwoButton, HeadlineThreeButton];
    return (
      <div>
        {buttons.map((Button, i) => // eslint-disable-next-line
          <Button key={i} {...this.props} />
        )}
      </div>
    );
  }
}

class HeadlinesButton extends Component {
  onClick = () =>
    // A button can call `onOverrideContent` to replace the content
    // of the toolbar. This can be useful for displaying sub
    // menus or requesting additional information from the user.
    this.props.onOverrideContent(HeadlinesPicker);

  render() {
    return (
      <div className="headlineButtonWrapper">
        <button onClick={this.onClick} className="headlineButton">
          H
        </button>
      </div>
    );
  }
}
const linkPlugin = createLinkPlugin();

const toolbarPlugin = createToolbarPlugin({
  structure: [
    BoldButton,
    ItalicButton,
    UnderlineButton,
    CodeButton,
    HeadlinesButton,
    UnorderedListButton,
    OrderedListButton,
    linkPlugin.LinkButton
  ]
});

const { Toolbar } = toolbarPlugin;
const plugins = [toolbarPlugin, linkPlugin];

class PageEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createWithContent(convertFromRaw(this.props.content))
    };
  }

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  focus = () => {
    this.editor.focus();
  };

  convert() {
    const data = convertToRaw(this.state.editorState.getCurrentContent());

    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "pageData.json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  render() {
    return (
      <div>
        <div className={!this.props.readOnly ? 'editor' : '' } onClick={this.focus}>
          <Editor
            readOnly={this.props.readOnly}
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => { this.editor = element; }}
          />

          {!this.props.readOnly ? <Toolbar /> : ''}
        </div>
        {!this.props.readOnly ? <button onClick={this.convert.bind(this)}>Convert</button> : ''}
      </div>
    );
  }
}

export default PageEditor;