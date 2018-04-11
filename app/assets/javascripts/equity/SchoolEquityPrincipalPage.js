import React from 'react';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import _ from 'lodash';
import SectionHeading from '../components/SectionHeading'
import Card from '../components/Card'
import WidestDifferencesSummary from './WidestDifferencesSummary'

// takes {homeroomName: [students...]}
// returns {homeroomName: {categoryA: count, categoryB: count...}}
const toStudentCounts = function (byHomeroom) {
  return _.mapValues(byHomeroom, (students) => {
    return {
      lowIncome: students.filter(student => student.free_reduced_lunch !== 'Not Eligible').length,
      disability: students.filter(student => student.disability !== null).length,
      limitedEnglish: students.filter(student => student.limited_english_proficiency !== 'Fluent').length,
      topQuartileStarMath: students.filter(
        student => student.most_recent_star_math_percentile > 75).length,
      bottomQuartileStarMath: students.filter(
        student => student.most_recent_star_math_percentile < 25).length,
      topQuartileStarReading: students.filter(
        student => student.most_recent_star_reading_percentile > 75).length,
      bottomQuartileStarReading: students.filter(
        student => student.most_recent_star_reading_percentile < 25).length,
    };
  });
}

const categoriesToSentences = {
  lowIncome: 'Students from low income families',
  disability: 'Students with a disability',
  limitedEnglish: 'Students with a limited English',
  topQuartileStarMath: 'Students in top quartile for STAR Math',
  bottomQuartileStarMath: 'Students in bottom quartile for STAR Math',
  topQuartileStarReading: 'Students in top quartile for STAR Reading',
  bottomQuartileStarReading: 'Students in bottom quartile for STAR Reading',
};

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
      const students = studentsByGrade[grade];

      return this.renderGrade(students, grade);
    }, this);
  }

  renderGrade(gradeStudents, grade) {
    const byHomeroom = _.groupBy(gradeStudents, 'homeroom_name');

    return (
      <Card style={styles.card}>
        <SectionHeading>Grade {grade}</SectionHeading>
        <div style={styles.contentWrapper}>
          <div style={styles.contentArea}>
            <p style={styles.contentTitle}>Teacher Statement</p>
            <br/>
            <p>...</p>
          </div>
          <div style={styles.contentArea}>
            <p style={styles.contentTitle}>Widest Differences</p>
            <br/>
            {this.renderWidestDifferences(byHomeroom)}
          </div>
        </div>
      </Card>
    );
  }

  renderWidestDifferences(byHomeroom) {
    const homeroomsToStudentCounts = toStudentCounts(byHomeroom);

    return (
      <WidestDifferencesSummary
        homeroomsToStudentCounts={homeroomsToStudentCounts}
        categoriesToSentences={categoriesToSentences}
      />
    );
  }

}

SchoolEquityPrincipalPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired
};

const styles = {
  card: {
    margin: 20,
  },
  contentArea: {
    flex: 1,
    margin: '20px 10px'
  },
  contentTitle: {
    fontWeight: 'bold',
    fontSize: 18
  },
  contentWrapper: {
    display: 'flex'
  }
}
