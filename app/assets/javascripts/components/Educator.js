import PropTypes from 'prop-types';
import React from 'react';

/*
Canonical display of an educator, showing their name as a link to email them.
*/
class Educator extends React.Component {

  // Turns SIS format (Watson, Joe) -> Joe Watson
  educatorName(educator) {
    if (educator.full_name === null) return educator.email.split('@')[0] + '@';
    const parts = educator.full_name.split(', ');
    return parts[1] + ' ' + parts[0];
  }

  render() {
    const {educator, style} = this.props;
    const educatorName = this.educatorName(educator);

    return (
      <a
        className="Educator"
        style={style || {}}
        href={'mailto:' + educator.email}>
        {educatorName}
      </a>
    );
  }

}

Educator.propTypes = {
  educator: PropTypes.shape({
    full_name: PropTypes.string, // or null
    email: PropTypes.string.isRequired
  }).isRequired,
  style: PropTypes.object
};

export default Educator;
