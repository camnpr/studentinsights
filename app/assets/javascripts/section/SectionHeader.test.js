import React from 'react';
import ReactDOM from 'react-dom';
import SectionHeader from './SectionHeader';

describe('data', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
      <SectionHeader
        section={{
          section_number: 8,
          course_description: 'Art',
          course_number: 3,
          room_number: '101',
          schedule: 'MF',
        }}
        sections={[
          {id: 1, section_number: 1}
        ]}
      />, div);
  });
});

describe('empty data', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
      <SectionHeader
        section={{}}
        sections={[]}
      />, div);
  });
});
