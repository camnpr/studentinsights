import ReactDOM from 'react-dom';
import FixedTable from '../../../app/assets/javascripts/components/FixedTable';
import * as Filters from '../../../app/assets/javascripts/helpers/Filters';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const items = [
    { caption: 'MTSS Meeting', percentage: 0.23, filter: jest.fn() },
    { caption: 'SST Meeting', percentage: 0.31, filter: jest.fn() }
  ];
  ReactDOM.render(
    <FixedTable
      title="Services"
      filters={[Filters.ServiceType(504)]}
      onFilterToggled={jest.fn()}
      items={items}
      limit={3}
    />, div);
});
