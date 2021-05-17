import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {File} from '../../../../models/app/file';
import {AppHttpService} from '../../../../services/app/app-http.service';
import {HttpParams} from '@angular/common/http';
import {Paginator} from '../../../../models/setting/paginator';
import {MessageService} from '../../../../services/app/message.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {JobBoardHttpService} from '../../../../services/job-board/job-board-http.service';

@Component({
    selector: 'app-view-files',
    templateUrl: './view-files.component.html',
    styleUrls: ['./view-files.component.scss']
})
export class ViewFilesComponent implements OnInit {
    @Input() filesIn: File[];
    @Output() filesOut = new EventEmitter<File[]>();
    @Output() files = new EventEmitter<any[]>();
    @Input() paginatorIn: Paginator;
    @Output() paginatorOut = new EventEmitter<Paginator>();
    @Output() searchOut = new EventEmitter<string>();
    selectedFiles: any[];
    clonedFiles: { [s: string]: File; } = {};

    constructor(private appHttpService: AppHttpService, private jobBoardHttpService: JobBoardHttpService,
                private messageService: MessageService, private spinnerService: NgxSpinnerService) {
    }

    ngOnInit(): void {
    }

    upload(event) {
        this.files.emit(event);
    }

    download(file: File) {
        const params = new HttpParams().append('full_path', file.full_path);
        this.appHttpService.downloadFiles(params).subscribe(response => {
            const binaryData = [];
            binaryData.push(response);
            const filePath = URL.createObjectURL(new Blob(binaryData, {type: response['type']}));
            const downloadLink = document.createElement('a');
            downloadLink.href = filePath;
            downloadLink.setAttribute('download', file.full_name);
            document.body.appendChild(downloadLink);
            downloadLink.click();
        }, error => {
            this.messageService.error(error);
        });
    }

    delete(file = null) {
        this.messageService.questionDelete({})
            .then((result) => {
                if (result.isConfirmed) {
                    if (file) {
                        this.selectedFiles = [];
                        this.selectedFiles.push(file);
                    }
                    const ids = this.selectedFiles.map(element => element.id);
                    this.appHttpService.deleteFiles(ids).subscribe(response => {
                        this.messageService.success(response);
                        this.remove(ids);
                        this.selectedFiles = [];
                    }, error => {
                        this.messageService.error(error);
                    });
                }
            });
    }

    remove(ids) {
        console.log(ids);
        for (const id of ids) {
            this.filesIn = this.filesIn.filter(element => element.id !== id);
            console.log(this.filesIn);
            this.paginatorIn.total = (parseInt(this.paginatorIn.total, 10) - 1).toString();
        }
        console.log(this.filesIn.length);
        this.filesOut.emit(this.filesIn);
    }

    pageChange(event) {
        this.paginatorIn.current_page = event.page + 1;
        this.paginatorOut.emit(this.paginatorIn);
    }

    searchFiles(event, search) {
        if (event.type === 'click' || event.keyCode === 13 || search.length === 0) {
            this.searchOut.emit(search);
        }
    }

    changeFile(file: File, value: string) {
        file.full_name = value + '.' + file.extension;
    }

    onRowEditInit(file: File) {
         this.clonedFiles[file.id] = {...file};
    }

    onRowEditSave(file: File) {
        this.spinnerService.show();
        this.appHttpService.updateFile(file).subscribe(response => {
            this.spinnerService.hide();
            this.messageService.success(response);
        }, error => {
            this.spinnerService.hide();
            this.messageService.error(error);
        });
    }

    onRowEditCancel(file: File, index: number) {
        this.filesIn[index] = this.clonedFiles[file.id];
        delete this.clonedFiles[file.id];
    }
}