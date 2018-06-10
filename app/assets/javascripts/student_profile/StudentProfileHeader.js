import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import RiskBubble from '../student_profile/RiskBubble';
import ModalSmall from '../student_profile/ModalSmall';
import * as Routes from '../helpers/Routes';


/*
This pure UI component renders top-line information like the student's name, school and
classroom.
*/
export default class StudentProfileHeader extends React.Component {
  render() {
    const student =  this.props.student;
    return (
      <div className="StudentProfileHeader" style={styles.titleContainer}>
        <div style={{ display: 'inline-block', flex: 'auto' }}>
          <a href={Routes.studentProfile(student.id)} style={styles.nameTitle}>
            {student.first_name + ' ' + student.last_name}
          </a>
          <div style={{ display: 'inline-block' }}>
            {this.renderBulletSpacer()}
            <a href={Routes.school(student.school_id)} style={styles.subtitleItem}>
              {student.school_name}
            </a>
            {this.renderBulletSpacer()}
            {this.renderHomeroomOrEnrollmentStatus()}
            {this.renderBulletSpacer()}
            <span style={styles.subtitleItem}>
              {'Grade ' + student.grade}
            </span>
            {this.renderDateOfBirth()}
            {this.renderBulletSpacer()}
            {this.renderContactIcon()}
          </div>
        </div>
        <div
          style={{
            width: '15em',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
          <RiskBubble riskLevel={student.student_risk_level.level} />
        </div>
      </div>
    );
  }

  renderBulletSpacer() {
    return (
      <span style={styles.subtitleItem}>
        •
      </span>
    );
  }

  renderHomeroomOrEnrollmentStatus() {
    const student =  this.props.student;
    if (student.enrollment_status === 'Active') {
      if (student.homeroom_name) return (
        <a
          className="homeroom-link"
          href={Routes.homeroom(student.homeroom_id)}
          style={styles.subtitleItem}>
          {'Homeroom ' + student.homeroom_name}
        </a>
      );

      return (<span style={styles.subtitleItem}>No homeroom</span>);
    } else {
      return (
        <span style={styles.subtitleItem}>
          {student.enrollment_status}
        </span>
      );
    }
  }

  renderDateOfBirth () {
    const student =  this.props.student;
    const dateOfBirth = student.date_of_birth;
    if (!dateOfBirth) return null;

    const momentDOB = moment.utc(dateOfBirth);
    const ageInWords = ' (' + moment().diff(momentDOB, 'years') + ' years old)';

    return (
      <span>
        {this.renderBulletSpacer()}
        <span style={styles.subtitleItem}>
          {momentDOB.format('M/D/YYYY')}
          {ageInWords}
        </span>
      </span>
    );
  }

  renderContactIcon () {
    return (
      <ModalSmall
        title='Contact Information'
        icon={<span className='address-book-icon'></span>}
        content={this.renderContactInformation()} />
    );
  }

  renderContactInformation(){
    const student = this.props.student;
    return (
      <span>
        <span style={styles.contactItem}>
          {student.student_address}
        </span>
        <span style={styles.contactItem}>
          {student.primary_phone}
        </span>
        <span style={styles.contactItem}>
          <a href={'mailto:'+ student.primary_email}>{student.primary_email}</a>
        </span>
      </span>
    );
  }
}
StudentProfileHeader.propTypes = {
  student: PropTypes.object.isRequired
};

const styles = {
  titleContainer: {
    fontSize: 16,
    padding: 20,
    display: 'flex'
  },
  nameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 5
  },
  titleItem: {
    fontSize: 24,
    padding: 5
  },
  subtitleItem: {
    fontSize: 22,
    padding: 5
  },
  contactItem: {
    fontSize: 15,
    padding: 6,
    display: 'flex'
  }
};