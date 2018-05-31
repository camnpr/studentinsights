import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from '../components/SectionHeading';
import _ from 'lodash';
import RichTextEditor from 'react-rte';

const styles = {
  textarea: {
    marginTop: 20,
    fontSize: 14,
    border: '4px solid rgba(153,117,185, 0.4)',
    width: '100%'
  }
};

const notePrompts = `**What are this student's strengths?**
\n\n...

**What is this student's involvement in the school community like?**
\n\n...

**How does this student relate to their peers?**
\n\n...

**Who is the student's primary guardian?**
\n\n...

**Any additional comments or good things to know about this student?**
\n\n...`;

const restrictedNotePrompts = `**Is this student receiving Social Services and if so, what is the name and contact info of their social worker?** \n\n...

**Is this student receiving mental health supports?** \n\n...`;

class TransitionNotes extends React.Component {

  constructor(props) {
    super(props);

    const transitionNotes = props.transitionNotes;
    const regularNote = _.find(transitionNotes, {is_restricted: false});
    const restrictedNote = _.find(transitionNotes, {is_restricted: true});
    const initRegularNoteText = (regularNote ? (regularNote.text || '') : notePrompts);
    const initRestrictedNoteText = (restrictedNote ? (restrictedNote.text || '') : restrictedNotePrompts);

    this.state = {
      regularNoteRichValue: RichTextEditor.createValueFromString(initRegularNoteText, 'markdown'),
      restrictedNoteRichValue: RichTextEditor.createValueFromString(initRestrictedNoteText, 'markdown'),

      regularNoteId: (regularNote ? regularNote.id : null),
      restrictedNoteId: (restrictedNote ? restrictedNote.id : null)
    };

    this.onChange = this.onChange.bind(this);
    this.onClickSave = this.onClickSave.bind(this);
    this.onClickSaveRestricted = this.onClickSaveRestricted.bind(this);
    this.buttonText = this.buttonText.bind(this);
    this.buttonTextRestricted = this.buttonTextRestricted.bind(this);
  }

  buttonText() {
    const {requestState} = this.props;

    if (requestState === 'pending') return 'Saving ...';

    if (requestState === 'error') return 'Error ...';

    return 'Save Note';
  }

  buttonTextRestricted() {
    const {requestStateRestricted} = this.props;

    if (requestStateRestricted === 'pending') return 'Saving ...';

    if (requestStateRestricted === 'error') return 'Error ...';

    return 'Save Note';
  }

  onClickSave() {
    const params = {
      is_restricted: false,
      text: this.state.regularNoteRichValue.toString('markdown')
    };

    if (this.state.regularNoteId) {
      _.merge(params, {id: this.state.regularNoteId});
    }

    this.props.onSave(params);
  }

  onClickSaveRestricted() {
    const params = {
      is_restricted: true,
      text: this.state.restrictedNoteRichValue.toString('markdown')
    };

    if (this.state.restrictedNoteId) {
      _.merge(params, {id: this.state.restrictedNoteId});
    }

    this.props.onSave(params);
  }

  onChange(richValue, noteType) {
    this.setState({[noteType]: richValue});
  }

  render() {
    const {noteText, restrictedNoteText, readOnly} = this.state;
    const toolbarConfig = { display: [] };

    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1, margin: 30}}>
          <SectionHeading>
            High School Transition Note
          </SectionHeading>
          <RichTextEditor
            rootStyle={{height: 400}}
            toolbarConfig={toolbarConfig}
            value={this.state.regularNoteRichValue}
            onChange={(richValue) => this.onChange(richValue, 'regularNoteRichValue')}
          />
          {this.renderButton(this.onClickSave, this.buttonText)}
        </div>
        <div style={{flex: 1, margin: 30}}>
          <SectionHeading>
            High School Transition Note (Restricted)
          </SectionHeading>
          <RichTextEditor
            rootStyle={{height: 400}}
            toolbarConfig={toolbarConfig}
            value={this.state.restrictedNoteRichValue}
            onChange={(richValue) => this.onChange(richValue, 'restrictedNoteRichValue')}
          />
          {this.renderButton(this.onClickSaveRestricted, this.buttonTextRestricted)}
        </div>
      </div>
    );
  }

  renderButton(onClickFn, buttonTextFn) {
    const {readOnly} = this.props;

    if (readOnly) return null;

    return (
      <button onClick={onClickFn} className='btn save'>
        {buttonTextFn()}
      </button>
    );
  }

}

TransitionNotes.propTypes = {
  readOnly: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  transitionNotes: PropTypes.array.isRequired,
  requestState: PropTypes.string,              // can be null if no request
  requestStateRestricted: PropTypes.string     // can be null if no request
};

export default TransitionNotes;

