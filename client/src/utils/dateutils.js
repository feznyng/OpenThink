import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addLocale(en);

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

export const getMonthString = (num) => {
    return monthNames[(num % 12)]
}

export const timeAgo = new TimeAgo('en-US')

export const ONE_HOUR = 60 * 60 * 1000;

export const getTimeString = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    let period = 'AM';
    if (hours > 12) {
        hours %= 12;
        period = 'PM'
    }
    return `${hours}:${minutes} ${period}`
}

export const getDateString = (dateEntry) => {
    const date = new Date(dateEntry);
    const month = monthNames[date.getMonth()]
    const day = date.getDay();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`
}

export const getDateDiff = (date1, date2) => {
    return Math.abs(date1 - date2);
}

export const getNowDateDiff = (date) => {
    return getDateDiff(date, new Date())
}

const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
]

export const getDay = (d) => {
    let date = new Date(d);

    return days[date.getDay()]
}


export const getMonth = (d) => {
    let date = new Date(d);

    return monthNames[date.getMonth()]
}

export const getHours = (d) => {
    let date = new Date(d);

    const hours = date.getHours()
    
    if (hours > 13) {
        return hours - 12
    } else {
        return hours
    }
}

export const getMinutes = (d, padded) => {
    let date = new Date(d);

    let minutes = date.getMinutes().toString()
    if (padded && minutes.length === 1) {
        minutes = '0' + minutes
    }

    return minutes
}

export const getTimeCode = (d) => {
    let date = new Date(d).toLocaleDateString('en-us')
    return date.substring(date.length - 2, date.length)
}

const MINUTE = 60,
  HOUR = MINUTE * 60,
  DAY = HOUR * 24,
  YEAR = DAY * 365;

export function getTimeAgo(date) {
  const secondsAgo = Math.round((+new Date() - date) / 1000);
  if (secondsAgo < MINUTE) {
    return secondsAgo + "s";
  } else if (secondsAgo < HOUR) {
    return Math.floor(secondsAgo / MINUTE) + "m";
  } else if (secondsAgo < DAY) {
    return Math.floor(secondsAgo / HOUR) + "h";
  } else if (secondsAgo < YEAR) {
    return date.toLocaleString("default", { day: "numeric", month: "short" });
  } else {
    return date.toLocaleString("default", { year: "numeric", month: "short" });
  }
}

export default function roundMinutes(date) {

  date.setHours(date.getHours() + Math.ceil(date.getMinutes()/60));
  date.setMinutes(0, 0, 0);

  return date;
}

export const getLocalTime = (date) => {
  const startTime = new Date(date.toString());
  return new Date( startTime.getTime() + ( startTime.getTimezoneOffset() * 60000 ) );
}

export const getEventDateString = (date, endDate) => {
  date = new Date(date)
  const month = getMonth(date)
  const day = getDay(date)
  
  let endString = ''
  let sameDay = false;
  
  if (endDate && new Date(endDate) !== date) {
    endDate = new Date(endDate)
    if (endDate.getDate() === date.getDate()) {
      sameDay = true
      endString += `- ${endDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
    } else {
      endString += `- ${getEventDateString(endDate)}`
    }
  }

  let string = `${day}, ${month} ${date.getDate()} at ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`

  if (endString.length > 0) {
    if (sameDay) {
      string = string.substring(0, string.length - 2) + endString
    } else {
      string += endString
    }
  }

  

  return string
}

export function formatSeconds(time) {   
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = ~~time % 60;

  var ret = "";
  if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }
  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}
