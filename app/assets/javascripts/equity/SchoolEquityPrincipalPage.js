import React from 'react';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import _ from 'lodash';

export default class SchoolEquityPrincipalPage extends React.Component {

  constructor(props) {
    super(props);

    this.fetchSchoolOverviewData = this.fetchSchoolOverviewData.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  fetchSchoolOverviewData() {
    const {schoolId} = this.props;
    const url = `/schools/${schoolId}/overview_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="SchoolEquityPrincipalPage">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchSchoolOverviewData}
          render={this.renderPage} />
      </div>
    );
  }

  renderPage(json) {
    const students = json.students;
    const studentsByGrade = _.groupBy(students, 'grade');
    const grades = Object.keys(studentsByGrade);

    return grades.map((grade) => {
      return this.renderGrade(grades[grade], grade);
    }, this);
  }

  renderGrade(gradeStudents, grade) {
    return (
      <h4>{grade}</h4>
    );
  }

}

SchoolEquityPrincipalPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired
};
