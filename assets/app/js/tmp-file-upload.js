/**
 * TmpFileUpload - Handles temporary file uploads with progress indication.
 * Uses XMLHttpRequest for upload progress events. Bootstrap 5 card markup.
 * File names are escaped to prevent XSS.
 *
 * @param {object} options Configuration overrides
 */
var TmpFileUpload = function (options) {
  this.fileIndex = 0;
  this.xhr = [];
  this.onComplete = null;
  this.uploadTrigger = '#file-upload-trigger';
  this.fileInput = '#file-upload';
  this.fieldName = 'files';
  this.uploadProgressContainer = '#upload-progress';
  this.individualFileProgressContainer = '#file-upload-progress-';
  this.csrfToken = null;
  this.init(options);
};

TmpFileUpload.prototype = {

  init: function (options) {
    var self = this;

    if (options && typeof options === 'object') {
      Object.keys(options).forEach(function (key) {
        self[key] = options[key];
      });
    }

    document.body.addEventListener('change', function (event) {
      if (event.target.closest(self.fileInput)) {
        self.handleSelectedFile(event.target);
      }
    });

    document.body.addEventListener('click', function (event) {
      if (event.target.closest(self.uploadTrigger)) {
        event.preventDefault();
        var input = document.querySelector(self.fileInput);
        if (input) input.click();
      }
    });
  },

  handleSelectedFile: function (input) {
    for (var i = 0; i < input.files.length; i++) {
      this.sendFile(input.files[i]);
    }
  },

  buildProgressHtml: function (fileName, progressId) {
    return '<div class="card border-primary mb-2">' +
      '<div class="card-header bg-primary text-white">' +
        '<i class="fa fa-file"></i> ' +
        '<span>' + AppUtil.escapeHtml(fileName) + '</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="progress" id="' + progressId + '">' +
          '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: 0;"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  },

  buildFileDetailsHtml: function (fieldName, fileIndex, tmpFileName, origFileName) {
    return '<input type="hidden" name="' + AppUtil.escapeHtml(fieldName) + '[' + fileIndex + '][tmp_file_name]" value="' + AppUtil.escapeHtml(tmpFileName) + '" />' +
      '<input type="hidden" name="' + AppUtil.escapeHtml(fieldName) + '[' + fileIndex + '][original_file_name]" value="' + AppUtil.escapeHtml(origFileName) + '" />';
  },

  sendFile: function (file) {
    var self = this;
    var idx = self.fileIndex;
    var uri = '/tmp-file-upload';
    var formData = new FormData();
    var progressId = self.individualFileProgressContainer.replace('#', '') + idx;

    self.xhr[idx] = new XMLHttpRequest();
    self.xhr[idx].open('POST', uri, true);
    self.xhr[idx].setRequestHeader('X-CSRF-Token', self.csrfToken);
    self.xhr[idx].onreadystatechange = self.transferComplete(idx, file);
    self.xhr[idx].upload.addEventListener('progress', self.updateProgress(idx));
    self.xhr[idx].upload.addEventListener('error', self.transferFailed(idx));
    self.xhr[idx].upload.addEventListener('abort', self.transferCanceled(idx));
    formData.append('file', file);

    var existing = document.getElementById(progressId);
    if (!existing) {
      var container = document.querySelector(self.uploadProgressContainer);
      if (container) {
        container.insertAdjacentHTML('beforeend', self.buildProgressHtml(file.name, progressId));
      }
    }

    self.xhr[idx].send(formData);
    ++self.fileIndex;
  },

  updateProgress: function (theFileIndex) {
    var self = this;
    return function (event) {
      if (event.lengthComputable) {
        var percentage = Math.round((event.loaded * 100) / event.total);
        var progressEl = document.querySelector('#' + self.individualFileProgressContainer.replace('#', '') + theFileIndex + ' .progress-bar');
        if (progressEl) {
          progressEl.style.width = percentage + '%';
          progressEl.setAttribute('aria-valuenow', percentage);
          progressEl.textContent = percentage + '%';
        }
      }
    };
  },

  transferComplete: function (theFileIndex, file) {
    var self = this;
    return function () {
      var xhr = self.xhr[theFileIndex];
      if (xhr.readyState !== 4) return;
      var progressId = self.individualFileProgressContainer.replace('#', '') + theFileIndex;
      var progressEl = document.getElementById(progressId);

      if (xhr.status === 200) {
        var tmpFileName = xhr.responseText.replace(/"/g, '');
        if (progressEl) {
          var bar = progressEl.querySelector('.progress-bar');
          if (bar) bar.remove();
          progressEl.classList.remove('progress');
          progressEl.innerHTML = self.buildFileDetailsHtml(self.fieldName, theFileIndex, tmpFileName, file.name);
        }
        if (typeof self.onComplete === 'function') {
          self.onComplete({
            filename: tmpFileName,
            size: file.size,
            original_filename: file.name
          });
        }
        AjaxBind.init();
      } else {
        var errorBar = progressEl ? progressEl.querySelector('.progress-bar') : null;
        if (errorBar) {
          errorBar.classList.add('bg-danger');
          errorBar.textContent = 'There was an error uploading your file! - HTTP ' + xhr.status + ' Error';
        }
      }
    };
  },

  transferFailed: function (theFileIndex) {
    return function () {
      PopTart.error('There was an error uploading one of your files!');
    };
  },

  transferCanceled: function (theFileIndex) {
    return function () {
      PopTart.warning('The file upload operation was aborted.');
    };
  }
};
