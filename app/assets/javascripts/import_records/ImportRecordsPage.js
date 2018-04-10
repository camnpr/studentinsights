import React from 'react';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import ImportRecordCard from './ImportRecordCard';
import QueuedJobCard from './QueuedJobCard';
import SectionHeading from '../components/SectionHeading';

export default class ImportRecordsPage extends React.Component {

  constructor(props) {
    super(props);

    this.fetchImportRecords = this.fetchImportRecords.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  fetchImportRecords() {
    return apiFetchJson('/api/import_records');
  }

  render() {
    return (
      <div className="ImportRecordsPage">
        <GenericLoader
          promiseFn={this.fetchImportRecords}
          render={this.renderPage} />
      </div>
    );
  }
  renderImportRecords(importRecords) {
    const divStyle = {margin: '15px 0'};

    if (importRecords.length === 0) return (
      <div style={divStyle}>No import records.</div>
    );

    return importRecords.map(this.renderRecord, this);
  }

  renderQueuedJobs(queuedJobs) {
    const divStyle = {margin: '15px 0'};

    if (queuedJobs.length === 0) return (
      <div style={divStyle}>No jobs in the queue.</div>
    );

    return queuedJobs.map(this.renderQueuedJob, this);
  }

  renderRecord(importRecord) {
    return <ImportRecordCard {...importRecord} key={importRecord.id} />;
  }

  renderQueuedJob(queuedJob) {
    return <QueuedJobCard {...queuedJob} key={queuedJob.id} />;
  }

  renderPage(json) {
    const outerWrapperStyle = {display: 'flex'};
    const columnStyle = {flex: 1, margin: '20px 40px', maxWidth: 600, overflowX: 'scroll'};

    return (
      <div style={outerWrapperStyle}>
        <div style={columnStyle}>
          <SectionHeading>Import Records</SectionHeading>
          {this.renderImportRecords(json.import_records)}
        </div>
        <div style={columnStyle}>
          <SectionHeading>Queued Jobs</SectionHeading>
          {this.renderQueuedJobs(json.queued_jobs)}
        </div>
      </div>
    );
  }

}
