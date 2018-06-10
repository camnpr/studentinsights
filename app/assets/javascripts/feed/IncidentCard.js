import PropTypes from 'prop-types';
import React from 'react';
import FeedCardFrame from './FeedCardFrame';
import HouseBadge from '../components/HouseBadge';
import Badge from '../components/Badge';
import Timestamp from '../components/Timestamp';


// Render a card in the feed for a discipline incident
class IncidentCard extends React.Component {
  render() {
    const {style, incidentCard} = this.props;
    const {student} = incidentCard;

    return (
      <div className="IncidentCard" >
        <FeedCardFrame
          style={style}
          student={student}
          whereEl={<div>in {incidentCard.incident_location}</div>}
          whenEl={<Timestamp railsTimestamp={incidentCard.occurred_at} />}
          badgesEl={<div>
            {student.house && <HouseBadge style={styles.footerBadge} house={student.house} />}
            <Badge style={styles.footerBadge} text="Incident" backgroundColor="rgb(255, 140, 0)" />
          </div>}
        >
          <div>{incidentCard.incident_description} (code: {incidentCard.incident_code})</div>
        </FeedCardFrame>
      </div>
    );
  }
}
IncidentCard.propTypes = {
  incidentCard: PropTypes.shape({
    id: PropTypes.number.isRequired,
    incident_code: PropTypes.string.isRequired,
    incident_location: PropTypes.string.isRequired,
    incident_description: PropTypes.string.isRequired,
    occurred_at: PropTypes.string.isRequired,
    has_exact_time: PropTypes.bool.isRequired,
    student: PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      grade: PropTypes.string.isRequired,
      house: PropTypes.string,
      homeroom: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        educator: PropTypes.object
      })
    })
  }),
  style: PropTypes.object
};


const styles = {
  footerBadge: {
    marginLeft: 5
  }
};

export default IncidentCard;