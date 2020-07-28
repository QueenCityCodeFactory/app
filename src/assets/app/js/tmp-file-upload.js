/*jshint multistr: true */
var TmpFileUpload = function(options) {
    this.fileIndex = 0;
    this.xhr = [];
    this.onComplete = null;
    this.uploadTrigger = '#file-upload-trigger';
    this.fileInput = '#file-upload';
    this.fieldName = 'files';
    this.uploadProgressContainer = '#upload-progress';
    this.individualFileProgressContainer = '#file-upload-progress-';
    this.csrfToken = null;
    this.fileDetailsHtml = '\
        <input type="hidden" name="FIELDNAME[FILE_INDEX][tmp_file_name]" value="TMP_FILE_NAME" />\
        <input type="hidden" name="FIELDNAME[FILE_INDEX][original_file_name]" value="ORIG_FILE_NAME" />\
    ';
    this.progressHtml = '\
        <div class="panel panel-primary">\
            <div class="panel-heading">\
                <i class="fa fa-file"></i>\
                <span>FILE_NAME</span>\
            </div>\
            <div class="panel-body">\
                <div class="progress" id="FILE_PROGRESS">\
                    <div class="progress-bar" role="progress-bar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: 0;"></div>\
                </div>\
            </div>\
        </div>\
    ';
    this.init(options);
};

TmpFileUpload.prototype = {

    init: function (options) {
        var self = this;

        if (options !== null && options !== undefined && typeof(options) === 'object') {
            $.each(options, function (index, value) {
                self[index] = value;
            });
        }

        $('body').on('change', self.fileInput, function (event) {
            self.handleSelectedFile($(this));
        });
        $('body').on('click', self.uploadTrigger, function (event) {
            event.preventDefault();
            $(self.fileInput).click();
        });
    },

    handleSelectedFile: function (fileInput) {
        var self = this;
        var fileLength = fileInput[0].files.length;

        for (var i = 0; i < fileLength; ++i) {
            self.sendFile(fileInput[0].files[i]);
        }
    },

    sendFile: function (file) {
        var self = this;
        var uri = '/tmp-file-upload';
        var formData = new FormData();

        self.xhr[self.fileIndex] = new XMLHttpRequest();
        self.xhr[self.fileIndex].open("POST", uri, true);
        self.xhr[self.fileIndex].setRequestHeader('X-CSRF-Token', self.csrfToken);
        self.xhr[self.fileIndex].onreadystatechange = self.transferComplete(self.fileIndex, file);
        self.xhr[self.fileIndex].upload.addEventListener('progress', self.updateProgress(self.fileIndex), false);
        self.xhr[self.fileIndex].upload.addEventListener('error', self.transferFailed(self.fileIndex), false);
        self.xhr[self.fileIndex].upload.addEventListener('abort', self.transferCanceled(self.fileIndex), false);
        formData.append('file', file);

        // create the div to hold the progress information here
        if ($(self.individualFileProgressContainer + self.fileIndex).length < 1) {
            $(self.uploadProgressContainer).append(
                self.progressHtml
                    .replace(new RegExp('FILE_NAME', 'g'), file.name)
                    .replace(new RegExp('FILE_PROGRESS', 'g'), (self.individualFileProgressContainer.replace('#', '') + self.fileIndex))
            );
        }

        self.xhr[self.fileIndex].send(formData);
        ++self.fileIndex;
    },

    updateProgress: function (theFileIndex) {
        var self = this;
        return function (event) {
            // this function is called as the file is uploaded to show progress
            if (event.lengthComputable) {
                var percentage = Math.round((event.loaded * 100) / event.total);
                $(self.individualFileProgressContainer + theFileIndex + ' > .progress-bar').css('width', percentage + '%').attr('aria-valuenow', percentage).text(percentage + '%');
            }
        };
    },

    transferComplete: function (theFileIndex, file) {
        var self = this;
        return function (event) {
            if (self.xhr[theFileIndex].readyState == 4 && self.xhr[theFileIndex].status == 200) {
                // the request is complete (readyState 4) and the HTTP status is success (200)
                $(self.individualFileProgressContainer + theFileIndex + ' > .progress-bar').remove();
                $(self.individualFileProgressContainer + theFileIndex)
                    .removeClass('progress')
                    .html(
                        self.fileDetailsHtml
                        .replace(new RegExp('FIELDNAME', 'g'), self.fieldName)
                        .replace(new RegExp('FILE_INDEX', 'g'), theFileIndex)
                        .replace(new RegExp('TMP_FILE_NAME', 'g'), self.xhr[theFileIndex].responseText.replace(new RegExp('"', 'g'), ''))
                        .replace(new RegExp('FILE_SIZE', 'g'), file.size)
                        .replace(new RegExp('ORIG_FILE_NAME', 'g'), file.name)
                    );
                if (typeof self.onComplete === 'function') {
                    self.onComplete({
                        filename: self.xhr[theFileIndex].responseText.replace(new RegExp('"', 'g'), ''),
                        size: file.size,
                        original_filename: file.name
                    });
                }
                AjaxBind.init();
            } else if (self.xhr[theFileIndex].readyState == 4 && self.xhr[theFileIndex].status != 200) {
                // the request is complete, but there was an HTTP error along the way
                $(self.individualFileProgressContainer + theFileIndex + ' > .progress-bar')
                    .addClass('progress-bar-danger')
                    .text('There was an error uploading your file! - HTTP ' + self.xhr[theFileIndex].status + ' Error');
            }
        };
    },

    transferFailed: function (theFileIndex) {
        return function (event) {
            alert('There was an error uploading one of your files!');
        };
    },

    transferCanceled: function (theFileIndex) {
        return function (event) {
            alert('The file upload operation was aborted!');
        };
    }
};
