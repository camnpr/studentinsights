import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {latestNoteDateText} from '../../helpers/latestNoteDateText';
import {sortByGrade} from '../../helpers/SortHelpers';
import ExperimentalBanner from '../../components/ExperimentalBanner';
import DashboardHelpers from '../DashboardHelpers';
import StudentsTable from '../StudentsTable';
import DashboardBarChart from '../DashboardBarChart';
import DashRangeButtons from '../DashRangeButtons';


class SchoolDisciplineDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      startDate: DashboardHelpers.schoolYearStart(),
      selectedChart: 'location',
      selectedCategory: null
    };
    this.setStudentList = this.setStudentList.bind(this);
    this.resetStudentList = this.resetStudentList.bind(this);
    this.selectChart = this.selectChart.bind(this);
  }

  setStudentList(highchartsEvent) {
    this.setState({selectedCategory: highchartsEvent.point.category});
  }
  resetStudentList() {
    this.setState({selectedCategory: null});
  }
  selectChart(selection) {
    this.setState({selectedChart: selection.value, selectedCategory: null});
  }

  filterIncidentDates(incidentsArray) {
    return incidentsArray.filter((incident) => {
      return moment.utc(incident.occurred_at).isSameOrAfter(moment.utc(this.state.startDate));
    });
  }

  studentDisciplineIncidentCounts(incidentCategory) {
    let studentDisciplineIncidentCounts = {};
    const selectedChartData = this.getChartData(this.state.selectedChart);
    const incidents = incidentCategory ? selectedChartData.disciplineIncidents[incidentCategory] : this.props.schoolDisciplineEvents;
    incidents.forEach((incident) => {
      studentDisciplineIncidentCounts[incident.student_id] = studentDisciplineIncidentCounts[incident.student_id] || 0;
      studentDisciplineIncidentCounts[incident.student_id]++;
    });
    return studentDisciplineIncidentCounts;
  }

  getChartData(selectedChart) {
    //This chart data is filtered based on the date selection and passed to the
    //student table and chart renders below
    const filteredEvents = this.filterIncidentDates(this.props.schoolDisciplineEvents);
    return {
      type: selectedChart,
      disciplineIncidents: _.groupBy(filteredEvents, selectedChart),
      title: "Incidents by " + selectedChart};
  }

  sortChartKeys(chartKeys) {
    switch(this.state.selectedChart) {
    case 'time': return this.sortedTimes(chartKeys);
    case 'day': return this.sortedDays(chartKeys);
    case 'grade': return this.sortedGrades(chartKeys);
    default: return this.sortedByIncidents(chartKeys);
    }
  }

  sortedDays(chartKeys) {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  sortedTimes(chartKeys) {
    //chartKeys will either contain a time like "4:00 pm", "10:00 am", or "Not Logged"
    return chartKeys.sort((a, b) => {
      if (a == "Not Logged") return -1;
      if (b == "Not Logged") return 1;
      return new Date('1970/01/01 ' + a) - new Date('1970/01/01 ' + b);
    });
  }

  sortedGrades(chartKeys) {
    return chartKeys.sort((a,b) => sortByGrade(a,b));
  }

  sortedByIncidents(chartKeys) {
    const chart = this.getChartData(this.state.selectedChart);
    return chartKeys.sort((a,b) => {
      return chart.disciplineIncidents[b].length - chart.disciplineIncidents[a].length;
    });
  }

  //For grades and classrooms, the students table should only show the relevant students
  groupStudents() {
    if (this.state.selectedChart === 'grade' && this.state.selectedCategory) {
      return this.props.dashboardStudents.filter(student => student.grade === this.state.selectedCategory);
    } else if (this.state.selectedChart === 'classroom' && this.state.selectedCategory) {
      return this.props.dashboardStudents.filter(student => student.homeroom_label === this.state.selectedCategory);
    } else return this.props.dashboardStudents;
  }

  render() {
    const selectedChart = this.getChartData(this.state.selectedChart);
    const chartOptions = [
      {value: 'location', label: 'Location'},
      {value: 'time', label: 'Time'},
      {value: 'classroom', label: 'Classroom'},
      {value: 'grade', label: 'Grade'},
      {value: 'day', label: 'Day'},
      {value: 'offense', label: 'Offense'},
    ];

    return(
      <div>
      <ExperimentalBanner />
        <div className="DashboardContainer">
          <div className="DashboardRosterColumn">
            {this.renderRangeSelector()}
            {this.renderStudentDisciplineTable()}
          </div>
          <div className="DashboardChartsColumn">
            <div style={styles.graphTitle}>
              <div style={styles.titleText}>
                Incidents by:
              </div>
              <Select
                value={this.state.selectedChart}
                onChange={this.selectChart}
                options={chartOptions}
                style={styles.dropdown}
                clearable={false}
              />
            </div>
           {this.renderDisciplineChart(selectedChart)}
          </div>
        </div>
      </div>
    );
  }

  renderDisciplineChart(selectedChart) {
    const categories = this.sortChartKeys(Object.keys(selectedChart.disciplineIncidents));
    const seriesData = categories.map((type) => {
      if (!selectedChart.disciplineIncidents[type]) return [];
      const incidents = selectedChart.disciplineIncidents[type];
      return [type, incidents.length];
    });

    return (
        <DashboardBarChart
          id = "Discipline"
          categories = {{categories: categories}}
          seriesData = {seriesData}
          titleText = {null}
          measureText = {'Number of Incidents'}
          tooltip = {{
            pointFormat: 'Total incidents: <b>{point.y}</b>'}}
          onColumnClick = {this.setStudentList}
          onBackgroundClick = {this.resetStudentList}/>
    );
  }

  renderStudentDisciplineTable() {
    const students = this.groupStudents();
    const studentDisciplineIncidentCounts = this.studentDisciplineIncidentCounts(this.state.selectedCategory);
    let rows =[];
    students.forEach((student) => {
      rows.push({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        last_sst_date_text: latestNoteDateText(300, student.sst_notes),
        events: studentDisciplineIncidentCounts[student.id] || 0,
        grade: student.grade
      });
    });

    return (
      <StudentsTable
        rows = {rows}
        selectedCategory = {this.state.selectedCategory}
        incidentType={"Incidents"}
        resetFn={this.resetStudentList}/>
    );
  }

  renderRangeSelector() {
    const ninetyDaysAgo = moment.utc().subtract(90, 'days').format("YYYY-MM-DD");
    const fortyFiveDaysAgo = moment.utc().subtract(45, 'days').format("YYYY-MM-DD");
    const schoolYearStart = DashboardHelpers.schoolYearStart();
    return (
      <div className="DashboardRangeButtons">
        <DashRangeButtons
          schoolYearFilter={() => this.setState({startDate: schoolYearStart, selectedRange: 'School Year'})}
          ninetyDayFilter={() => this.setState({startDate: ninetyDaysAgo, selectedRange: '90 Days'})}
          fortyFiveDayFilter={() => this.setState({startDate: fortyFiveDaysAgo, selectedRange: '45 Days'})}/>
      </div>
    );
  }
}

SchoolDisciplineDashboard.propTypes = {
  dashboardStudents: PropTypes.array.isRequired,
  schoolDisciplineEvents: PropTypes.arrayOf(PropTypes.shape({
    student_id: PropTypes.number.isRequired, //ID of student involved in incident
    location: PropTypes.string, //Place where incident occurred
    time: PropTypes.string, //Time of day for incident - NULL if no specific time recorded
    classroom: PropTypes.string, //Name of student's homeroom teacher
    student_grade: PropTypes.string, //Grade of student
    day: PropTypes.string, //Day of week on which incident occurred
    offense: PropTypes.string, //Specific type of incident
    student_race: PropTypes.string, //Race of student
    occurred_at: PropTypes.string, //Date for incident, used in filtering specific date ranges
    last_sst_date_text: PropTypes.string //Date of last SST meeting
  })).isRequired
};

export default SchoolDisciplineDashboard;

const styles = {
  graphTitle: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px'
  },
  titleText: {
    fontSize: '18px',
    marginRight: '10px',
    alignSelf: 'center'
  },
  dropdown: {
    width: '200px'
  }
};
