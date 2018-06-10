import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import * as FeedHelpers from '../helpers/FeedHelpers';
import NoteCard from './NoteCard';


/*
Renders the list of notes.
*/
export default class NotesList extends React.Component {
  render() {
    const mergedNotes = FeedHelpers.mergedNotes(this.props.feed);
    return (
      <div className="NotesList">
        {(mergedNotes.length === 0) ? <div style={styles.noItems}>
          No notes
        </div> : mergedNotes.map(mergedNote => {
          switch (mergedNote.type) {
          case 'event_notes': return this.renderEventNote(mergedNote);
          case 'deprecated_interventions': return this.renderDeprecatedIntervention(mergedNote);
          }
        })}
      </div>
    );
  }

  renderEventNoteTypeBadge(eventNoteTypeId) {
    const eventNoteType = this.props.eventNoteTypesIndex[eventNoteTypeId];
    if (eventNoteType === undefined) return null;
    return (
      <span style={styles.badge}>
        {eventNoteType.name}
      </span>
    );
  }

  renderEventNote(eventNote) {
    return (
      <NoteCard
        key={['event_note', eventNote.id].join()}
        eventNoteId={eventNote.id}
        student={eventNote.student}          
        eventNoteTypeId={eventNote.event_note_type_id}
        noteMoment={moment.utc(eventNote.recorded_at)}
        badge={this.renderEventNoteTypeBadge(eventNote.event_note_type_id)}
        educatorId={eventNote.educator_id}
        text={eventNote.text || ''}
        numberOfRevisions={eventNote.event_note_revisions.length}
        attachments={eventNote.attachments}
        educatorsIndex={this.props.educatorsIndex}
        onSave={this.props.onSaveNote}
        onEventNoteAttachmentDeleted={this.props.onEventNoteAttachmentDeleted} />
    );
  }

  // TODO(kr) support custom intervention type
  // This assumes that the `end_date` field is not accurate enough to be worth splitting
  // this out into two note entries.
  renderDeprecatedIntervention(deprecatedIntervention) {
    return (
      <NoteCard
        key={['deprecated_intervention', deprecatedIntervention.id].join()}
        noteMoment={moment.utc(deprecatedIntervention.start_date_timestamp, 'MMMM-YY-DD')}
        badge={<span style={styles.badge}>Old intervention</span>}
        educatorId={deprecatedIntervention.educator_id}
        text={_.compact([deprecatedIntervention.name, deprecatedIntervention.comment, deprecatedIntervention.goal]).join('\n')}
        educatorsIndex={this.props.educatorsIndex}
        // deprecated interventions have no attachments
        attachments={[]} />
    );
  }
}
NotesList.propTypes = {
  feed: InsightsPropTypes.feed.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  eventNoteTypesIndex: PropTypes.object.isRequired,
  onSaveNote: PropTypes.func,
  onEventNoteAttachmentDeleted: PropTypes.func
};

const styles = {
  noItems: {
    margin: 10
  },
  badge: {
    display: 'inline-block',
    background: '#eee',
    outline: '3px solid #eee',
    width: '10em',
    textAlign: 'center',
    marginLeft: 10,
    marginRight: 10
  }
};