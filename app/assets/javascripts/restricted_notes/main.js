import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {readEnv} from '../envForJs';
import RestrictedNotesPageContainer from './RestrictedNotesPageContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';


export default function restrictedNotesMain(el) {
  const serializedData = $('#serialized-data').data();
  const {districtKey} = readEnv();
  ReactDOM.render(
    <PerDistrictContainer districtKey={districtKey}>
      <RestrictedNotesPageContainer
        serializedData={serializedData}
        nowMomentFn={moment.utc} />
    </PerDistrictContainer>
  , el);
}
