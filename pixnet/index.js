var instance_skel = require('../../instance_skel');
var debug;
var log;

/**
 * Create an instance of a PIXNET module.
 *
 * @param {EventEmitter} system - the brains of the operation
 * @param {string} id - the instance ID
 * @param {array} config - saved user configuration parameters
 * @since 1.0.0
 */
function instance(system, id, config) {
	var self = this;

	self.currentModel    = {};
	self.currentInterval = {};
	self.states          = {};
	self.pollingActive   = 0;
	self.errorCount      = 0;
	self.testInterval    = 10000;
	self.pollUrl         = "";
	self.testUrl         = "";

	self.CONFIG_MODEL = {
		250: { id: 250, label: 'Video Devices PIX 250i', type: 'video', ports: ['TC', 'SYNC', 'LINE', 'AES', 'SDI', 'HDMI'] },
		260: { id: 260, label: 'Video Devices PIX 260i', type: 'video', ports: ['TC', 'SYNC', 'LINE', 'AES', 'DANTE', 'SDI', 'HDMI'] },
		270: { id: 270, label: 'Video Devices PIX 270i', type: 'video', ports: ['TC', 'SYNC', 'LINE', 'AES', 'DANTE', 'MADI', 'SDI', 'HDMI'] },
		970: { id: 970, label: 'Sound Devices 970',      type: 'audio', ports: ['TC', 'SYNC', 'LINE', 'AES', 'DANTE', 'MADI'] }
	};

	self.CHOICES_ACTION = [
		{ id: 'Accept', label: 'Accept' },
		{ id: 'Reject', label: 'Reject' }
	];

	self.CHOICES_DRIVELIST = [];

	self.CHOICES_DRIVEMODE = [
		{ id: 'Off',                         label: 'Off' },
		{ id: 'Record',                      label: 'Record' },
		{ id: 'Ethernet File Transfer',      label: 'Ethernet File Transfer' },
		{ id: 'Switch to Network upon Full', label: 'Switch to Network upon Full' }
	];

	self.CHOICES_FEEDBACK = [
		{ id: '0', label: 'No' },
		{ id: '1', label: 'Yes' }
	];

	self.CHOICES_KEYCODE = [
		{ id: '0x01000080', label: 'Play',   icon: 'play' },
		{ id: '0x01000081', label: 'Stop',   icon: 'stop' },
		{ id: '0x01000082', label: 'RW',     icon: 'rw' },
		{ id: '0x01000083', label: 'FF',     icon: 'ff' },
		{ id: '0x01000084', label: 'Record', icon: 'rec' },
		{ id: '0x0100004e', label: 'Audio' },
		{ id: '0x0100004f', label: 'LCD' },
		{ id: '0x01000050', label: 'Files' },
		{ id: '0x01000051', label: 'Menu' },
		{ id: '0x01000004', label: 'Enter' }
	];

	self.CHOICES_KEYEVENTTYPE = [
		{ id: 'KeyPressAndRelease', label: 'Press &amp; Release' },
		{ id: 'KeyPress',           label: 'Press' },
		{ id: 'KeyRelease',         label: 'Release' }
	];

	self.CHOICES_MODEL = [
		{ id: '250', label: 'Video Devices PIX 250i' },
		{ id: '260', label: 'Video Devices PIX 260i' },
		{ id: '270', label: 'Video Devices PIX 270i' },
		{ id: '970', label: 'Sound Devices 970' }
	];

	self.CHOICES_PLAYBACKSPEED = [
		{ id: 'PlayX2',  label: 'x2' },
		{ id: 'PlayX16', label: 'x16' }
	];

	self.CHOICES_TRANSPORTSTATE = [
		{ id: 'play',  label: 'Play' },
		{ id: 'stop',  label: 'Stop' },
		{ id: 'rec',   label: 'Rec' }
	];

	self.ICONS = {
		stop:   'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA4CAYAAABez76GAAAAeElEQVRoge3RwQnEQAwEQa3zz3kvhAajhzmqAhhQawAAgBfOVrR77/3SA845K7c9GyP/TKAgUBAoCBQECgIFgYJAQaAgUBAoCBQECgIFgYJAQaAgUBAoCBQECgIFgYJAQaAgUBAoCBQECgIFgYJAQaAgEAAAsG1mfrAnBEhVMW7cAAAAAElFTkSuQmCC',
		play:   'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA4CAYAAABez76GAAABsElEQVRoge3aOU7DQBSA4d+I23AmDgShYFEkoGCRoAJBnSYXSJOKBqQUFCClQJFAoLAYRZqBsGSx37M947yvA4Wx82MnnrExxhhjjDHG5JBoREvT9BpYBnaAfeAxlH9GksjeolagdOzHB6AJbAN9jfElQgzkvQAHwAbQ09hOHiEH8t6BM2AN6GpsL4sYAo1rAetAW2O784gtkNdxR9Ql8KGxD5PEGsgbffs1gGNgqLEvv8UeyLsHNoFdYKCxT15dAnkDF2kLuNMYsG6BvKE77RruNMytroG+hgYu3Ad6J88AdQ80ru0uEVpZ/miRAnldd0SdA2+zXryIgbyem8YcAs+TXrTIgby+mxg33UT5Bwv07QnYc9dTt/63FuivV+DUXSJcWaDpTpIkWZUMsFTCTkatjoFGp9gRsAKIjh7cOnJd/PshbYFmfM1LxRxorgtFqRgDZZpqSMUUKNdkVSr0QOLlDqlQA6ktmEmFFkh9yVUqlECFLdpLVR2o8Ns+UlUFKu3GoVTZgUq/9SxVRqBKH16QKjJQEI+/SBURKKgHqKS0At2E+gieMcYYY4wxpnTAJ8xVqYrkBp1KAAAAAElFTkSuQmCC',
		rw:     'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA4CAYAAABez76GAAACxklEQVRoge2aS4hPURzHP9erKCRENiaFjQUroUZeiyFiQWQ22Jilx5JZYImxsJDyyDPySBND3gtNLDxigyIbj5BQ1HgcnX+/pqa/x/9/7/ecO+l86r/9dM73f+/3nnvOJZFIJBKJRCKRSJSBc071a3DO3XXONQudLc65F0Vi6ddLrqrJQAcwGhgh8GXAFmBTUVFvCGgOcAYYIvL5Oe0FVqlkZbIcOAT0F41hEHAKaFLNqY9KlIN1wHFhOCOB68pwKOkK8v2wHVgvdI4DLgLjhc4KsQMaABwEVgidU6zgRwmd3cQMyJfwaWCu0DnPnIOFzh7E6iD/+L4pDmclcD5kOEQKaALQaWsdFRuAI8KC/yOhA5oK3AIaRD5f8G1W8lEI2UHzbU0yUOTzBX8YWCby1USoK2g10C4MZ6g9qaKGQ6CANgP7hO4xVvCzRb66UN5ifYHdwFqhcyJwCRgrdNaFKiB/Kx0FlgjHNs1u0+FCZ90oAhpmE5khHNdC4ISww3KTFRU45x4Ck4RjugE0Kvsxy7Lc81QE5Io6QlMkIMW/9Eg8P38F/RQ7c6MIqNFWyyrOAYuBr/HjqEYR0Ad7qz4rHFe7bcW+FzpzoSpC/28vBfYIx9ZpT8ZCpxJFUa6kfwAtQKvQ+RiYDjwQOusixKvGVmCNBabgJTATuBYmgr8T6mV1P7BIWLQfbTP+pMhXMyH3gy4As4B3Il+XHRPtEvlqIvSG2W0r2ucin7Pjoo0i3z+JseX6xIr2vtC5A2gGvgmdvyXWpv1rK9orQqffPVgAfBY6q4h5svrJJnRM6Lxswb8ROnsQ++i5y26NnULnPbuFnwqd3ZRxNu/s2EZ59PzMHgZ3hM4KZX680GaPbVXRvrVlRYfIV6HMgLBdwybrJwVfbIF6QDXAsgPyXLWifSXyfbdXnW0iXzH+928UE4lEIpFIJBKJaoBfqopjIillF90AAAAASUVORK5CYII=',
		rw_x2:  'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA4CAYAAABez76GAAACX0lEQVRoge3ZPU4cMRQH8L8DEgLS7BW2SRuJijISJe1eAY6wOcJQ5ABcYeukWsJHAxQg5QJwBKooUqqHLM3CW+982GPGfpbeX3Kxlj1j/9Yznp2FRqPRaDQajUbTFBOqQkQ5IXcBfAHwJ+IYh8aYO9/GnyJOlDp7AH4B+BFx3grAbUiHUoAszk8A3wBsDTyGxZmHdioBiOMMzSAcFACUFQfCgbLjQDCQCBwIBRKDA4FAonAgDEgcDgQBicSBECCxOBAAJBoHmYHE4yAjUBE4yPi64zIC5wbAfQyOMcZ73jmA/gLYj+j/H8BOzABCgEp6H5QlOYA+A7iK6G8vr7MPHE9ncq2g40ik76mQcgH9KwUp5z2oCKTcN2nxSBJ2sWIuN6/Y56CQZyEimhPRC73npa6DU/aI6JL6c93Qd1Uqj/7j/rEXAkRE5x3jPB+I1AXkhSQCiIiOnFVTNYBNByD1AfUijQ3ET37A6hcrDLxfWiucSQvcrGWCXUg+QJ1IYwNN2D3loa47Yeef13WzepAbPypZ/zagLiRfoFaksYE2QIjoiYP19F9bWT0TbEIKAWpESgFky7Lhyzno6TtzYH0m6CKFAm0gpQKaONt35/sZZ9UtAifIkYYArSGlBHryAXK+wYVznFCk3wOB3saRCsjdsu1qmjpt7Tb+wNpUDccJKbtE9DUCyJbDFED8XlKxlbRk7fgKs3izFujkJQXQ2q7Vss3PqT++N+oPLWMD8UuLPygu2WqZtuxybsQDbQ8weq5/OT8bYx5Z/SmAE/b5AsBjQ384bTQajUaj0Wg0msIC4BUXeJY+oXVrWQAAAABJRU5ErkJggg==',
		rw_x16: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA4CAYAAABez76GAAACw0lEQVRoge2YsW4UMRCGfwMSIqS5V7iGBziapEMKFbTLIxwPQHF5hL2CB8grXB2qRQEaQhEkXiB5hFyDkKiMLM0eg8+7a6+X21lpfsk6re0Z25/WM3MLlUqlUqlUKpUqJNNExVorGdgTAM8A/MjwcWKMue6a9CBjgbF0BOADgPcZ65cAvsZMnBogB+cSwAsAD3v6cHBWsZOnBIjD6askOJgQoFHgYCKARoODCQAaFQ6EAxodDgQDEgEHQgGJgQOBgETBgTBA4uBAECCRcCAEkFg4EABINBwI+NxxlQHnC4BvOXCMMY3n381pGjgAoJ8AnmbY/wbwOGcDMYCm+D3ooBoT0DGATxn27nqtB9xPUGO/Qa8zIZ3/b0hjA/olHZKEGCQakpQgLRaSpCwmElI2IFdK8AZg48ooAEVgbAGgovG6XTB34mPSTq5QjGmeTWn/qvDGzmyzNt5aR9baq5b5Tp879ld22OdVwimArLUza23lre8DumFjF3QA3jdPhNQFqBNSLiDufMEW3VDfPT3PGtYvmK85618F1inJj3/ANkgxgFoh5QJyG74nXze02JIf1APk5hTMhgOq7dzYzFunqzVBigXUCCkXUAjIrQcsZBcCtKK+iq6X9fz2gZQCKAhpCEAIxBbLr1wkoK6AWfWAlApobx8xHGLS/BsAW/bs0uj3SM4hbSkNr5mfM2ptGqUEeJRwqFnEvDZ7pzsAz40xO+Du2gKYU430scNPDemSaqg+OiebqA9tMW9QSQeotfKeY1QD2XI4pLtEXw7SKwDvEu24HKTTDPtdDCrYlS1ZkK4SY1AwzXtJYNkjpmS1IQD5WWsvzccAov6NbdbtoeEMAYinY14o1lnNgdi7ai2AQtV27WchFVBbkHaxYU2/PGu9BbBssVtTQP8n01HseeneQhbDtgf5Y6lSqVQqlUqlUg0qAH8AIUmKP9YJCzEAAAAASUVORK5CYII=',
		ff:     'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA4CAYAAABez76GAAACxUlEQVRoge2aS4hNcRzHP2c8ikIyMlkwKaxkbAjlrTwi78hYoGR2DEsssPRaYYON8VyIiVkwXoWy8KjZoGhWKJJRlMFf//rdW9NV3Hu+/3NO+n/qLu+ncz+d8zv/c/6XSCQSiUQikUgkkgfOuW7nXItzDtGn2Tn3xDnXqHKmoU7QdAxwHDgAJAJfPTAFeAQ0CXypUAQqsQc4BfQX+RqAe8B8ka8mlIE8m4FrwGCRbyjQAawX+apGHcizGLgDjBT5BgDngZ0iX1WECOSZCjwAxgmdR4DDojn3z4QK5BkPPLSBq6IVaAMGBjzuPoQM5Bllg3ah0LkBuG7zKTihA3mG2A/aKHQusPANQucfySIQNmjPAruEziZbK00QOivIKlCJQ8BR4aBttJvBNJGvgqwDeXYAF4SDtt6WFUtEvj7kEcizzhaAw0S+QUA7sEXkK5NXIM88G7SjRb46e9TZK/KVpXky2dZKE4XHsB84AfRTyPIO5Blrg3a60LkduGyXXiqKEMgzAugElgmdK4GbwPA0ktS3W5f2jVRffgH3gTlCZ1eSJJNq/XLRAgUhSZKaf2dRLrES/gy6K3Z2pflykQJ9A1YAV4VOP/xnpREUJdBHe7XaLnResbcIn9JIihCoG5hpD54qTgJr7axMRd6BngMzgBdC5z6gBfipkKl2IGrhNrAK+Czy+SDbgNPKg8wr0CVgE/Bd5POX0hrghshXJo9L7Jht46jifADmhohDDmfQbtuZUPEGWAS8DHXAWQXqtU3FNqHzme3BvRM6K8gi0BdgtT04qrhlzp7QBx96Br0HZovjnAOWZhGHwIFe2RrnqdDpd1ebhQP+r4QK9NhWx6+FzlbbNsr07UGIGdRha5KvIl+vrZkuinxVoT6DzgDLhXF67E6VSxzEgQ4CW4EfIt9bG/CdIl8+/O//UYxEIpFIJBKJRCoBfgMGW2f3alZArwAAAABJRU5ErkJggg==',
		ff_x2:  'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA4CAYAAABez76GAAACSElEQVRoge3ZPU7DMBgG4LeAhKhYeoWcoFKnjiBG1lyhHCEcIQwcoFfoDFPLzwQMcAAGOEI2QExGlhzJmDhObMch7vdKFkro5zhPnThtQaFQKBQKhUKhVGXUVoUxNgfw6KA5BfAK4KuPd2Q0anfKOxbHeACQW9SVuQRwDWDs0Eew2ADxZA5IuwCOAFwNAckWCI5IGAqSCxC2AckVCLEj+QBCzEi+gBArkk8gxIjkGwixIXUBhJiQugJCLEhdAiEGpK6BMHSkEEAYMtJewGNljvUl0rGn8TSKzfdBzPGY3wD2Heo/ABzaFof4PmirEhroAsCTQ/2dy+yxSUggjnPuUM9xTj2Op1FCAfnC+fQ4pkYJATRYHAQAGjQOOgYaPA46BOoThz+QFvyRTbTCw0Nq8zBzcv4sWdPuDT3cMsbGhj50bVnT79L9GbdBDCdnwjEBueCcSP0UYiwqWNInUBOcOiAdTi69ZibtX0kYfDuTticauLQvoKY4OqC6mTMRJ83zLPYtpNpM7EvFOLKKPsr6XoDa4FQBNbmsVJA3Bayu/ZpZoYHa4qhAbe4564o3Z2aoSdWZFhLIBkcGantDli81prmUdLNuVe4PBWSLw9uN5Wo1kS4tE1BehRMKaO6Aw9uUMXZgUacu2Xw2JcprEnFf0s7yEEB9tFQ56XImrTUzrBA1f8YaK5C6alUt8xkzp/uPHD3gyJeWvGqtpdmSaFY5Na2BQv6qYZt38eGX/32R+jgDsJC2N8r/q7L5t2dJoVAoFAqFQhlQAPwAAS+/taN37wAAAAAASUVORK5CYII=',
		ff_x16: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA4CAYAAABez76GAAACtUlEQVRoge2ZMY4TMRSG/wEkpBXNXiEnQFoa6BYtFbTDEZYDUAxHSAoOsFdIDVUQUAHFcgCK5AhJBYgCPWRka18se8Yzzw5k5n2Si/HEz/a3tp81C0VRFEVRFEUJUXVZIaKHAD4L7N0H8A3Az//1L1BVcQ23Etp/AjAX9P8awFsAJ4IY/4wUQYZGIOk2gHMAb45RUqogCCXhWCX1EYQpSuorCFOTNEQQpiRpqCBMRZJEEKYgSSoIY5eUQxDGLCmXIIxVUk5BGKOk3IIwNkklBGFMku4UjN0I2ztJjzONZxAp34NI2McvAHcF7b8DuCccQyvS70GTprSgBYAvgvYfSq+eLkoKMnJeCdobOc8yjmcQpQTlkvMj45gGUULQaOSggKBRyUFmQaOTg4yCDirH3Fv8AmBprm0A6sC7MwAr+96VK8F4b6Bu5uYu2VI+dkR4T0QnHTH2SmCMcxav9t5dtPS9FN+DOybXJadLUG85fEJEdEpEKy+mL+iavbuyY+Z1s1KCUuS0CYrJ4avhjNUvbd2WyQlRs7HP2PuG1bt+TDktIShVTkxQ28oxE9/a313bukt/okyQ+U3N2nBBrt2Wi+jaslJBfeSEBKVsqz0hRLTmwiLjDAlqbN3Kbi/y4mYX1FeOL6jPmeOfLeS2XA9B80AMzqpLUJ80f+h7znMAO/Zs+v4q6H9n57BgcS5siZL6wUwi57fgEmgmJTlEneANgAdVVf19tqtmDWBm70jvYgFSVtAj4cp5CeDpADlzOwFH4z2n4ATtnBzGRjCnGwacOTlK7Z177pCOnhmRMyiW5nkSuDxGQXtZK5TmUwTZ+iXFWefIYocuPB3zi6LLatvQ7bdFUOi27eJEs6Kj5H81hrKxSWHjZa0XANq2w8Ie6HuZzp49T+xWcmJdRlMURVEURVGUAQD4A0LSdiAL9TIFAAAAAElFTkSuQmCC',
		rec:    'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA4CAYAAABez76GAAACPElEQVRoge2avU4UYRSGn5FGCdBRKjEhAZWeArXCoDeAwVtQuRcTLWjwIigI0U5AQkKn7lIIUUs6sYVjJjkkuOFnZuf9dmbX8yRbzc5zzr6ZnZ9vDkEQBEEQBEEQdEGmCs3Myu5yF1gAHgL3gAlg1LcdAz+AFrAJbACHZeRZJvtpGvKACnyGzGzJzLbM7NSKc+r7LLnj2lqNo0DT82bWKhHKZbTcNTAB3TSzFUEwnay4u68DGjez3QThnLHrNZIFlPIkPQ58AqZUNS5hH3gEHJ3frDpJ39D1+Q/DwFoPwsFrrHlNOakCegPMJnJfxKzXbC4dV6u6mG/6OSg/Ir/4jV8dtIEZ4KSp56DnNYaTMw0sKoXqgF6Kfd3wSilT/sXyZ6vvSme3rQCTWZYdKGTKI+hpA8LBe1hQyZQBzQldVZH1ogzogdBVlfsqkTKg20JXVSZUImVAowW+0ytGVHVSPWoMDMqAjhsUyh+VSBnQL6GrKj9VImVA34SuqnxViZQBbQpdVdlSiZQBbfhtft2Y9yJBGVD+7LPdgIA+ey8S1Jf5d2JfN7xVytQLZkO+YDat8pak8QtmJ8BrsbMMy96DjBR30h+B90l+/tWsAh9qqFuMjhd3w2a208OF+x2vGS8OL6AvXxziDT8G9hLW2PMaRwW+Wy9XDC/ciuGFYuMvT8ysLQim7a6Bmw86P0C1XXKAynyfF70eoKp7BO+Zj+DlN5Z3gDHf9tuXLNr+ELze9yN4QRAEQRAEQfD/APwFUzTUavUUWL8AAAAASUVORK5CYII='
	};

	// super-constructor
	instance_skel.apply(this, arguments);
	self.actions(); // export actions
	return self;
}

/**
 * Setup the actions.
 *
 * @param {EventEmitter} system - the brains of the operation
 * @public
 * @since 1.0.0
 */
instance.prototype.actions = function(system) {
	var self = this;

	if ( self.currentModel == undefined ) {
		self.currentModel = self.CONFIG_MODEL[270];
		self.log('error', 'No model selected.  Setting as PIX 270i temporarily.');
	}

	self.system.emit('instance_actions', self.id, {
		'play':              { label:   'Play' },
		'stop':              { label:   'Stop' },
		'rec':               { label:   'Record' },
		'fastForward':       {
			label:   'Fast Forward',
			tooltip: 'This command will have no effect when the transport state is \'Stop\' or \'Record\'.',
			options: [
				{
					type:    'dropdown',
					label:   'Speed',
					id:      'playbackSpeed',
					choices: self.CHOICES_PLAYBACKSPEED,
					default: 'PlayX2'
				}
			]
		},
		'fastReverse':       {
			label:   'Fast Reverse',
			tooltip: 'This command will have no effect when the transport state is \'Stop\' or \'Record\'.',
			options: [
				{
					type:    'dropdown',
					label:   'Speed',
					id:      'playbackSpeed',
					choices: self.CHOICES_PLAYBACKSPEED,
					default: 'PlayX2'
				}
			]
		},
		'falseTake':         {
			label:   'False Take',
			tooltip: 'This command will trigger an OK/Cancel dialog.  Use a \'Close Message Box\' action to complete.'
		},
		'jamReceivedTC':     { label:   'Jam Received TC' },
		'jamTimeOfDay':      { label:   'Jam Time-of-Day' },
		'keyPress':          {
			label:   'Key Press',
			options: [
				{
					type:    'dropdown',
					label:   'Key',
					id:      'keyCode',
					choices: self.CHOICES_KEYCODE,
					default: '0x01000051'
				},
				{
					type:    'dropdown',
					label:   'Event Type',
					id:      'keyEventType',
					choices: self.CHOICES_KEYEVENTTYPE,
					default: 'KeyPressAndRelease'
				}
			]
		},
		'closeMessageBox':   {
			label:   'Close Message Box',
			options: [
				{
					type:    'textinput',
					label:   'Button Text to Push (exactly as it appears on the LCD)',
					id:      'buttonText',
					regex:   '/^[a-zA-Z0-9_\- ]*$/',
					default: 'OK'
				}
			]
		},
		'setDialogDismiss':  {
			label:   'Set Dialog Dismiss',
			options: [
				{
					type:    'textinput',
					label:   'Time (0 disables automatic dismissal)',
					id:      'time',
					regex:   '/^([0]?[0-9]|[1-5][0-9]|60)$/',
					default: '2'
				},
				{
					type:    'dropdown',
					label:   'Action',
					id:      'action',
					choices: self.CHOICES_ACTION,
					default: 'Accept'
				}
			]
		},
		'formatAllDrives':   {
			label:   'Format All Drives',
			options: [
				{
					type:    'textinput',
					label:   'Label',
					id:      'label',
					regex:   '/^[a-zA-Z0-9_\-]*$/',
					default: 'PIX'
				}
			]
		},
		'createSoundReport': { label:   'Create Sound Report' },
		'setDriveMode':      {
			label:   'Set Drive Mode',
			options: [
				{
					type:    'dropdown',
					label:   'Drive',
					id:      'id',
					choices: self.CHOICES_DRIVELIST,
					default: '1'
				},
				{
					type:    'dropdown',
					label:   'Mode',
					id:      'mode',
					choices: self.CHOICES_DRIVEMODE,
					default: 'Record'
				}
			]
		}
	});
}

/**
 * Executes the provided action.
 *
 * @param {Array} action - the action to be executed
 * @public
 * @since 1.0.0
 */
instance.prototype.action = function(action) {
	var self = this;
	var opt = action.options
	var cmd;

	switch (action.action) {
		case 'play':
			cmd = 'settransport/play';
			break;
		case 'stop':
			cmd = 'settransport/stop';
			break;
		case 'rec':
			cmd = 'settransport/rec';
			break;
		case 'fastForward':
			cmd = 'invoke/RemoteApi/fastForwardPlay(PlaybackSpeed)/1/10,' + opt.playbackSpeed;
			break;
		case 'fastReverse':
			cmd = 'invoke/RemoteApi/fastReversePlay(PlaybackSpeed)/1/10,' + opt.playbackSpeed;
			break;
		case 'falseTake':
			cmd = 'invoke/RemoteApi/falseTake()';
			break;
		case 'jamReceivedTC':
			cmd = 'invoke/RemoteApi/jamReceivedTc()';
			break;
		case 'jamTimeOfDay':
			cmd = 'invoke/RemoteApi/jamTimeOfDay()';
			break;
		case 'keyPress':
			cmd = 'invoke/RemoteApi/simulateKey(int,KeyEventType)/2/5,' + opt.keyCode + '/10,' + opt.keyEventType;
			break;
		case 'closeMessageBox':
			cmd = 'invoke/RemoteApi/closeMessageBox(QString)/1/10,' + opt.buttonText;
			break;
		case 'setDialogDismiss':
			cmd = 'invoke/RemoteApi/setAutoDismiss(int,DialogControl)/2/5,' + opt.time + '/10,' + opt.action;
			break;
		case 'formatAllDrives':
			cmd = 'invoke/RemoteApi/formatAllDrives(QString,QString)/2/10,' + opt.label + '/10,EXFAT';
			break;
		case 'createSoundReport':
			cmd = 'invoke/RemoteApi/createSoundReportCurrentReel()';
			break;
		case 'setDriveMode':
			cmd = 'setsetting/RecordToDrive' + opt.id + '=' + opt.mode;
			break;
	}

	if (cmd != undefined) {
		cmd = encodeURI('http://' + self.config.host + '/sounddevices/' + cmd);

		self.system.emit('rest', cmd, {}, self.processResult.bind(self));
	}
};

/**
 * Creates the configuration fields for web config.
 *
 * @returns {Array} the config fields
 * @public
 * @since 1.0.0
 */
instance.prototype.config_fields = function() {
	var self = this;

	return [
		{
			type:    'textinput',
			id:      'host',
			label:   'Target IP',
			tooltip: 'The IP of the device',
			width:   6,
			regex:   self.REGEX_IP
		},
		{
			type:    'dropdown',
			id:      'model',
			label:   'Model',
			tooltip: 'The make/model of the device',
			choices: self.CHOICES_MODEL,
			default: 270
		},
		{
			type:    'text',
			id:      'info',
			width:   12,
			label:   'Information',
			value:   'Enabling feedback can disrupt other PIXNET sessions.  Do not enable if you plan to also control the device via a web browser.  The recommended polling interval from Sound Devices is 200ms.  Companion default is 500ms to reduce overhead.  Shorter polling intervals could cause delays in other actions and feedbacks being processed.'
		},
		{
			type:    'dropdown',
			id:      'feedback',
			label:   'Enable Feedback?',
			tooltip: 'Determines if Companion will regularly request status from the device',
			choices: self.CHOICES_FEEDBACK,
			default: '0'
		},
		{
			type:    'textinput',
			id:      'pollInterval',
			label:   'Polling Interval (in ms)',
			tooltip: 'Sets the inerval at which Companion will check for status updates',
			width:   6,
			regex:   '/^([1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-4][0-9]{3}|5000)$/',
			default: '500'
		}
	]
};

/**
 * Clean up the instance before it is destroyed.
 *
 * @public
 * @since 1.0.0
 */
instance.prototype.destroy = function() {
	var self = this;

	debug("destory", self.id);
	self.system.emit('rest_poll_destroy', self.id);
};

/**
 * Processes a feedback state.
 *
 * @param {Array} feedback - the feedback type to process
 * @param {Array} bank - the bank this feedback is associated with
 * @returns {Array} feedback information for the bank
 * @public
 * @since 1.0.0
 */
instance.prototype.feedback = function(feedback, bank) {
	var self = this;
	var out  = {};

	if (feedback.type == 'transport') {
		if (feedback.options.state == self.states['transport']) {
			out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	else if (feedback.type == 'drive_mode') {
		if (feedback.options.state == self.states['drive_mode_'+feedback.options.drive]) {
			out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

	return out;
}

/**
 * Main initialization function called once the module
 * is OK to start doing things.
 *
 * @public
 * @since 1.0.0
 */
instance.prototype.init = function() {
	var self = this;
	self.processConfig();

	debug = self.debug;
	log   = self.log;
};

/**
 * INTERNAL: initialize feedbacks
 *
 * @private
 * @since 1.0.0
 */
instance.prototype.initFeedbacks = function() {
	var self = this;
	// feedbacks
	var feedbacks = {};

	feedbacks['transport'] = {
		label:       'Change colors from transport state',
		description: 'When the device is in the selected transport state, change colors of the bank',
		options:     [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(0,255,0)
			},
			{
				 type: 'dropdown',
				 label: 'Input',
				 id: 'state',
				 default: 'play',
				 choices: self.CHOICES_TRANSPORTSTATE
			}
		]
	};
	feedbacks['drive_mode'] = {
		label:       'Change colors from drive',
		description: 'When a drive is in a specific state, change colors of the bank',
		options:     [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(0,0,255)
			},
			{
				 type: 'dropdown',
				 label: 'Drive',
				 id: 'drive',
				 default: '1',
				 choices: self.CHOICES_DRIVELIST
			},
			{
				 type: 'dropdown',
				 label: 'Mode',
				 id: 'mode',
				 default: 'Record',
				 choices: self.CHOICES_DRIVEMODE
			}
		]
	};

	self.setFeedbackDefinitions(feedbacks);
}

/**
 * INTERNAL: initialize presets
 *
 * @private
 * @since 1.0.0
 */
instance.prototype.initPresets = function() {
	var self = this;
	/*var presets = [];

	self.setPresetDefinitions(presets);*/
}

/**
 * INTERNAL: initialize variables
 *
 * @private
 * @since 1.0.0
 */
instance.prototype.initVariables = function() {
	var self = this;
	// nothing here yet
}

/**
 * INTERNAL: process the configuration data and setup the module.
 * Abstracted due to different call points needed within the class.
 *
 * @private
 * @since 1.0.0
 */
instance.prototype.processConfig = function() {
	var self = this;
	self.system.emit('rest_poll_destroy', self.id);

	self.pollUrl         = encodeURI('http://' + self.config.host + '/sounddevices/update');
	/* Test URL cannot be changed without also updating processResult() to account for different test response */
	self.testUrl         = encodeURI('http://' + self.config.host + '/sounddevices/devtbl');

	self.status(self.STATUS_UNKNOWN);

	self.currentInterval = {};

	if ( self.CONFIG_MODEL[ self.config.model ] !== undefined ) {
		self.currentModel = self.CONFIG_MODEL[ self.config.model ];
	}
	else {
		self.currentModel = self.CONFIG_MODEL[270];
		self.log('error', 'No model selected.  Setting as PIX 270i temporarily.');
	}

	self.CHOICES_DRIVELIST = [{ id: '1', label: 'D1' },{ id: '2', label: 'D2' }];

	if ( self.currentModel.id > 250 ) {
		self.CHOICES_DRIVELIST.push( { id: '3', label: 'D3' } );
		self.CHOICES_DRIVELIST.push( { id: '4', label: 'D4' } );
	}

	self.initPresets();

	// technically should be able to test pollInterval > 0 since its REGEX enforced, but meh
	if (self.config.host !== undefined && self.config.feedback == 1 && self.config.pollInterval >= 100 && self.config.pollInterval <= 5000 ) {
		self.initFeedbacks();
		self.initVariables();
		self.setupConnectivtyTester();
	}
	else {
		self.status(self.STATUS_OK, 'Feedback Disabled');
	}
}

/**
 * INTERNAL: Callback for REST calls to process the return
 *
 * @param {?boolean} err - null if a normal result, true if there was an error
 * @param {Array} result - data: & response: if normal; error: if error
 * @private
 * @since 1.0.0
 */
instance.prototype.processResult = function(err, result) {
	var self = this;

	if (err !== null) {
		self.log('error', 'Poll result failure');

		if (self.pollingActive === 1) {
			self.errorCount++;
		}

		if (self.errorCount > 10) {
			self.setupConnectivtyTester();
		}
	}
	else {
		if ( Array.isArray(result) ) {
			for (var key in result) {
				switch(key) {
					case 'DevTable':
						self.status(self.STATUS_OK);
						self.setupPolling();
						break;
					case 'Transpoprt':
						self.states['transport'] = result[key];
						self.checkFeedbacks('transport');
						break;
					case 'FileName':
						break;
				}
			}
		}

	}
}

/**
 * INTERNAL: uses rest_poll to create an interval to, effectively, ping
 * the device to see if its there.  This uses a longer interval so we're
 * not firing a ton of poll calls to a non-responsive device.
 *
 * @private
 * @since 1.0.0
 */
instance.prototype.setupConnectivtyTester = function() {
	var self = this;

	self.errorCount    = 0;
	self.pollingActive = 0;
	self.system.emit('rest_poll_destroy', self.id);

	self.system.emit(
		'rest_poll',
		self.id,
		self.testInterval,
		self.testUrl,
		{},
		function (err, pollInstance) {
			if (Array.isArray(pollInstance) && pollInstance.length > 0) {
				self.currentInterval = pollInstance;
			}
			else {
				self.currentInterval = {};
				self.status(self.STATUS_ERROR, 'Connectivity Failed');
				self.log('error', 'Failed to create connectivity interval timer');
			}
		},
		self.processResult.bind(self)
	);
}

/**
 * INTERNAL: uses rest_poll to create an interval to run the active polling.
 *
 * @private
 * @since 1.0.0
 */
instance.prototype.setupPolling = function() {
	var self = this;

	self.errorCount = 0;
	self.system.emit('rest_poll_destroy', self.id);
	self.syncState();

	self.system.emit(
		'rest_poll',
		self.id,
		parseInt(self.config.pollInterval),
		self.pollUrl,
		{},
		function (err, pollInstance) {
			if (Array.isArray(pollInstance) && pollInstance.length > 0) {
				self.currentInterval = pollInstance;
				self.pollingActive = 1;
			}
			else {
				self.currentInterval = {};
				self.status(self.STATUS_ERROR, 'Polling Failed');
				self.log('error', 'Failed to create polling interval timer');
			}
		},
		self.processResult.bind(self)
	);
}

/**
 * INTERNAL: prior to starting active polling this will fire a bunch of rest
 * calls to get the feedback up to date.
 *
 * @private
 * @since 1.0.0
 */
instance.prototype.syncState = function() {
	var self = this;
	var queries = [
		'transport',
		'getsettings/RecordToDrive1,RecordToDrive2,RecordToDrive3,RecordToDive4'
	];

	for (var key in queries) {
		var cmd = encodeURI('http://' + self.config.host + '/sounddevices/' + queries[key]);

		self.system.emit('rest', cmd, {}, self.processResult.bind(self));
	}
}

/**
 * Process an updated configuration array
 *
 * @param {Array} config - the new configuration
 * @public
 * @since 1.0.0
 */
instance.prototype.updateConfig = function(config) {
	var self = this;
	self.config = config;

	self.processConfig();
}

instance_skel.extendedBy(instance);

exports = module.exports = instance;
