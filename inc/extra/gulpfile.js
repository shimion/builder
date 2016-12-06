var gulp = require('gulp');
var wpPot = require('gulp-wp-pot');
var gettext = require('gulp-gettext');
var sort = require('gulp-sort');
var pofill = require('gulp-pofill');
var rename = require('gulp-rename');

gulp.task('default', function () {
    // Create POT out of i18n.php. 
    gulp.src('includes/i18n.php')
        .pipe(sort())
        .pipe(wpPot( {
            destFile:'extra.pot',
            package: 'extra',
            bugReport: 'https://github.com/Freemius/wordpress-sdk/issues',
            lastTranslator: 'Vova Feldman <vova@extra.com>',
            team: 'Freemius Team <admin@extra.com>'
        } ))
        .pipe(gulp.dest('languages/'));

    // Create English PO out of the POT.
    gulp.src('languages/extra.pot')
        .pipe(pofill({
            items: function(item) {
                // If msgstr is empty, use identity translation 
                if (!item.msgstr.length) {
                  item.msgstr = [''];
                }
                if (!item.msgstr[0]) {
                    item.msgstr[0] = item.msgid;
                }
                return item;
            }
        }))
        .pipe(rename('extra-en.po'))
        .pipe(gulp.dest('languages/'));

    // Compile POs to MOs.
    gulp.src('languages/*.po')
        .pipe(gettext())
        .pipe(gulp.dest('languages/'))
});