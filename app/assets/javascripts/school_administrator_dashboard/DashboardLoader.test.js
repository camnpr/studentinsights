import React from 'react';
import { shallow } from 'enzyme';
import DashboardLoader from './DashboardLoader';

it('renders the generic loader', ()=> {
  const loader = shallow(<DashboardLoader schoolId={'School1'} dashboardTarget={'absences'}/>);
  expect(loader.find('GenericLoader').length).toEqual(1);
});
