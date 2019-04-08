export const getMatchDates = (str) => {
  return str.match(/\s*(?:(?:jan|feb)?r?(?:uary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|oct(?:ober)?|(?:sept?|nov|dec)(?:ember)?)\s+\d{1,2}\s*,?\s*\d{4}/ig);
};

export const getMatchTimes = (str) => {
  return str.match(/(\d{1,2})\s*:\s*(\d{2})\s*([ap]m?)/ig);
};

export const hrTo24 = (hr, pm) => {
  hr      = parseInt(hr);
  let fhr = (hr === 12 ? 0 : hr) + (pm ? 12 : 0);
  if (fhr < 10) {
    fhr = '0' + fhr;
  }
  return fhr;
}

export const formatSecondsToHHMM = (seconds) => {
  var d = Number(seconds);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m);
}

// Convert one of these 9:00 AM, 5:00 PM to 09:00 or 17:00
export const convertTimeStrToHourStr = (str, is24) => {
  let parts = str.toLowerCase().split(' '),
      time  = parts[0].split(':'),
      hr    = is24 ? hrTo24(time[0], (parts[1] === 'pm')) : time[0];
  return [hr, time[1]].join(':');
};


export const formatSecondsToDate = (seconds) => {
  return new Date(parseInt(seconds * 1000)).toLocaleDateString()
};

export const formatSecondsToDate2 = (seconds) => {
  return new Date(parseInt(seconds * 1000))
};

export const formatSecDurationToStr = (seconds) => {
  let hhmm   = formatSecondsToHHMM(seconds),
      split  = hhmm.split(':'),
      tothrs = parseInt(split[0]),
      days   = Math.floor(tothrs / 8),
      hrs    = tothrs % 8,
      mins   = parseInt(split[1]);

  return (days ? days + ' days' : '') + (hrs ? ' ' + hrs + ' hrs' : '') + (mins ? ' ' + mins + ' mins' : '');
};