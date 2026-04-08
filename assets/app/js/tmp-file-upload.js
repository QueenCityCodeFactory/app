/* global AppUtil, AppCore, PopTart */
/**
 * TmpFileUpload - Handles temporary file uploads with progress indication.
 * Uses XMLHttpRequest for upload progress events. Bootstrap 5 card markup.
 * File names are escaped to prevent XSS.
 *
 * @param {object} options Configuration overrides
 */
class TmpFileUpload {
  constructor(options) {
    this.fileIndex = 0;
    this.xhr = [];
    this.onComplete = null;
    this.uploadTrigger = '#file-upload-trigger';
    this.fileInput = '#file-upload';
    this.fieldName = 'files';
    this.uploadProgressContainer = '#upload-progress';
    this.individualFileProgressContainer = '#file-upload-progress-';
    this.csrfToken = null;

    if (options && typeof options === 'object') {
      Object.keys(options).forEach((key) => {
        this[key] = options[key];
      });
    }

    if (!this.csrfToken) {
      this.csrfToken = AppUtil.csrfToken();
    }

    document.body.addEventListener('change', (event) => {
      if (event.target.closest(this.fileInput)) {
        this.handleSelectedFile(event.target);
      }
    });

    document.body.addEventListener('click', (event) => {
      if (event.target.closest(this.uploadTrigger)) {
        event.preventDefault();
        const input = document.querySelector(this.fileInput);
        if (input) input.click();
      }
    });
  }

  handleSelectedFile(input) {
    for (let i = 0; i < input.files.length; i++) {
      this.sendFile(input.files[i]);
    }
  }

  buildProgressHtml(fileName, progressId) {
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
  }

  buildFileDetailsHtml(fieldName, fileIndex, tmpFileName, origFileName) {
    return '<input type="hidden" name="' + AppUtil.escapeHtml(fieldName) + '[' + fileIndex + '][tmp_file_name]" value="' + AppUtil.escapeHtml(tmpFileName) + '" />' +
      '<input type="hidden" name="' + AppUtil.escapeHtml(fieldName) + '[' + fileIndex + '][original_file_name]" value="' + AppUtil.escapeHtml(origFileName) + '" />';
  }

  sendFile(file) {
    const idx = this.fileIndex;
    const uri = '/tmp-file-upload';
    const formData = new FormData();
    const progressId = this.individualFileProgressContainer.replace('#', '') + idx;

    this.xhr[idx] = new XMLHttpRequest();
    this.xhr[idx].open('POST', uri, true);
    this.xhr[idx].setRequestHeader('X-CSRF-Token', this.csrfToken);
    this.xhr[idx].onreadystatechange = this.transferComplete(idx, file);
    this.xhr[idx].upload.addEventListener('progress', this.updateProgress(idx));
    this.xhr[idx].upload.addEventListener('error', this.transferFailed(idx));
    this.xhr[idx].upload.addEventListener('abort', this.transferCanceled(idx));
    formData.append('file', file);

    const existing = document.getElementById(progressId);
    if (!existing) {
      const container = document.querySelector(this.uploadProgressContainer);
      if (container) {
        container.insertAdjacentHTML('beforeend', this.buildProgressHtml(file.name, progressId));
      }
    }

    this.xhr[idx].send(formData);
    ++this.fileIndex;
  }

  updateProgress(theFileIndex) {
    return (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        const progressEl = document.querySelector('#' + this.individualFileProgressContainer.replace('#', '') + theFileIndex + ' .progress-bar');
        if (progressEl) {
          progressEl.style.width = percentage + '%';
          progressEl.setAttribute('aria-valuenow', percentage);
          progressEl.textContent = percentage + '%';
        }
      }
    };
  }

  transferComplete(theFileIndex, file) {
    return () => {
      const xhr = this.xhr[theFileIndex];
      if (xhr.readyState !== 4) return;
      const progressId = this.individualFileProgressContainer.replace('#', '') + theFileIndex;
      const progressEl = document.getElementById(progressId);

      if (xhr.status === 200) {
        const tmpFileName = xhr.responseText.replace(/"/g, '');
        if (progressEl) {
          const bar = progressEl.querySelector('.progress-bar');
          if (bar) bar.remove();
          progressEl.classList.remove('progress');
          progressEl.innerHTML = this.buildFileDetailsHtml(this.fieldName, theFileIndex, tmpFileName, file.name);
        }
        if (typeof this.onComplete === 'function') {
          this.onComplete({
            filename: tmpFileName,
            size: file.size,
            original_filename: file.name
          });
        }
        AppCore.init();
      } else {
        const errorBar = progressEl ? progressEl.querySelector('.progress-bar') : null;
        if (errorBar) {
          errorBar.classList.add('bg-danger');
          errorBar.textContent = 'There was an error uploading your file! - HTTP ' + xhr.status + ' Error';
        }
      }
    };
  }

  transferFailed() {
    return () => {
      PopTart.error('There was an error uploading one of your files!');
    };
  }

  transferCanceled() {
    return () => {
      PopTart.warning('The file upload operation was aborted.');
    };
  }
}
