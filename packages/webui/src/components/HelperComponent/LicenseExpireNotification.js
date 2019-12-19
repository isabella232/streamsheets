import { amber, red } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import CloseIcon from '@material-ui/icons/Close';
import Error from '@material-ui/icons/Error';
import Warning from '@material-ui/icons/Warning';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

const styles = {
	expired: {
		icon: Error,
		style: {
			backgroundColor: red[700],
			color: 'black'
		}
	},
	willExpire: {
		icon: Warning,
		style: {
			backgroundColor: amber[700],
			color: 'black'
		}
	},
	iconStyle: {
		fontSize: 20,
		opacity: 0.9,
		marginRight: 6
	},
	message: {
		display: 'flex',
		alignItems: 'center'
	}
};

const config = {
	expired: {
		Icon: styles.expired.icon,
		contentStyle: styles.expired.style,
		messageId: 'License.Expired',
		defMessage: 'Your Streamsheet {edition}-license has expired!'
	},
	warning: {
		Icon: styles.willExpire.icon,
		contentStyle: styles.willExpire.style,
		messageId: 'License.WillExpire',
		defMessage: '{days} days left until your Streamsheet {edition}-license expires!'
	}
};
// Workaround for Babel restriction, see https://github.com/yahoo/babel-plugin-react-intl/issues/119
const FormattedMessageFixed = (props) => <FormattedMessage {...props} />;

function LicenseExpireNotification({ edition='', service='', daysLeft }) {
	const isExpired = daysLeft < 1;
	const days = isExpired ? '' : daysLeft.toFixed();
	const Config = isExpired ? config.expired : config.warning;

	const [open, setOpen] = useState(false);
	const [prevDays, setPrevDays] = useState(-1);
	const onClose = () => setOpen(false);
	if (daysLeft !== prevDays) {
		setOpen(daysLeft < 20);
		setPrevDays(daysLeft);
	}
	return (
		<Snackbar
			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			key="daysLeft"
			open={open}
			// onClose={onClose}
			// autoHideDuration={8000}
		>
			<SnackbarContent
				aria-describedby="message-id"
				style={Config.contentStyle}
				message={
					<span style={styles.message} id="message-id">
						<Config.Icon style={styles.iconStyle} />
						<FormattedMessageFixed
							id={Config.messageId}
							defaultMessage={Config.defMessage}
							values={{ days, edition, service }}
						/>
					</span>
				}
				action={
					isExpired
						? []
						: [
								<IconButton key="close" aria-label="close" color="inherit" onClick={onClose}>
									<CloseIcon style={styles.iconStyle} />
								</IconButton>
						  ]
				}
			/>
		</Snackbar>
	);
}

LicenseExpireNotification.propTypes = {
	edition: PropTypes.string,
	daysLeft: PropTypes.number,
	service: PropTypes.string
};

LicenseExpireNotification.defaultProps = {
	edition: '',
	service: '',
	daysLeft: 1500
};

const mapStateToProps = (state) => {
	const { licenseInfo = {} } = state.meta;
	return { ...licenseInfo };
}

export default connect(mapStateToProps)(LicenseExpireNotification);
