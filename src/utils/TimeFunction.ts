export function getRelativeTime(date: string | number | Date, formatted: boolean = false): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  let relative = '';

  if (years > 0) {
    relative = `${years} ${years === 1 ? 'year' : 'years'} ago`;
  } else if (months > 0) {
    relative = `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else if (days > 0) {
    relative = `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
    relative = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (minutes > 0) {
    relative = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    relative = 'Just now';
  }

  if (formatted) {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const formattedDate = then.toLocaleDateString(undefined, options);
    return `${formattedDate} (${relative})`;
  }

  return relative;
}

// Format date to show "Today", "Yesterday", or actual date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}
