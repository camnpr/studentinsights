import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export default class WidestDifferencesSummary extends React.Component {

  constructor(props) {
    super(props);

    this.state = { showAll: false };
  }

  render() {
    const {categoriesToSentences, homeroomsToStudentCounts} = this.props;
    const categories = Object.keys(categoriesToSentences);
    const homeroomNames = Object.keys(homeroomsToStudentCounts);

    const arrayOfCategoriesToHomeroomCounts = categories.map((category) => {
      return {
        category: category,
        homerooms: (homeroomNames.map((name) => {
          return {
            name: name,
            count: homeroomsToStudentCounts[name][category],
          };
        }))
      }
    });

    const sortByWidestGaps = _.sortBy(arrayOfCategoriesToHomeroomCounts, (category) => {
      const counts = category.homerooms.map(h => h.count);
      return Math.max(...counts) - Math.min(...counts);
    }).reverse();

    const topTwo = _.take(sortByWidestGaps, 2);
    const theRest = _.takeRight(sortByWidestGaps, sortByWidestGaps)

    return (
      <div>
        {topTwo.map((categoryToHomeroomCounts) => {
          return this.renderCategoryBreakdown(categoryToHomeroomCounts);
        }, this)}
      </div>
    );
  }

  renderCategoryBreakdown(categoryToHomeroomCounts) {
    const {categoriesToSentences} = this.props;
    const category = categoryToHomeroomCounts.category;

    const categorySentence = categoriesToSentences[category];

    const sortedHomerooms = _.sortBy(
      categoryToHomeroomCounts.homerooms, (h) => { return h.count }).reverse();

    return (
      <div style={{margin: '10px 0'}} key={category}>
        <div>{categorySentence}:</div>
        <div>
          {sortedHomerooms.map((homeroom) => {
            return (
              <span key={`${homeroom.name}-${category}`}>
                {homeroom.name} has {homeroom.count}. </span>
            );
          })}
        </div>
      </div>
    );
  }


}

WidestDifferencesSummary.propTypes = {
  homeroomsToStudentCounts: PropTypes.object.isRequired,
  categoriesToSentences: PropTypes.object.isRequired,
};
