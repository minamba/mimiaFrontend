import { connect } from 'react-redux';
import { BaseApp } from '../components';

function mapStateToProps(state) {
  return {
    auth: state.auth,
    eleves: state.eleves,
    referentiel: state.referentiel,
    chat: state.chat,
  };
}

export const AppContainer = connect(mapStateToProps)(BaseApp);
export default AppContainer;
