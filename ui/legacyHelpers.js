// HELPERS
import '../app/assets/javascripts/helpers/react_helpers.jsx';
// (unordered)
import '../app/assets/javascripts/helpers/mixpanel_utils.jsx';
import '../app/assets/javascripts/helpers/profile_details_style.jsx';
import '../app/assets/javascripts/helpers/prop_types.jsx';
import '../app/assets/javascripts/helpers/sort_helpers.jsx';
import {colors, styles} from '../app/assets/javascripts/helpers/Theme';

// Export these so legacy components can use this, and
// new components can pull in components
window.shared || (window.shared = {});
window.shared.colors = colors;
window.shared.styles = styles;

