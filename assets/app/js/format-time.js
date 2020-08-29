$(function() {
    $('p.time,td.time').each(function(index) {
        if (this.innerText) {
            this.innerText = moment.utc(this.innerText, "M/D/YY, h:mm a").local().format("M/D/YY, h:mm a") + ' ' + moment.tz.zone(moment.tz.guess()).abbr(moment());
        }
    });

    $('p.short-time,td.short-time').each(function(index) {
        if (this.innerText) {
            this.innerText = moment.utc(this.innerText, "M/D/YY, h:mm a").local().format("M/D/YY h:mm a");
        }
    });

    $('p.short-date,td.short-date').each(function(index) {
        if (this.innerText) {
            this.innerText = moment.utc(this.innerText, "M/D/YY, h:mm a").local().format("M/D/YY");
        }
    });
});
