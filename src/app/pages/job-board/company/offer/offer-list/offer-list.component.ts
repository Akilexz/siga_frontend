import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Col} from '../../../../../models/setting/col';
import {Paginator} from '../../../../../models/setting/paginator';
import {MessageService} from '../../../../../services/app/message.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {JobBoardHttpService} from '../../../../../services/job-board/job-board-http.service';
import { Offer } from 'src/app/models/job-board/offer';
import {HttpParams} from '@angular/common/http';

@Component({
    selector: 'app-offer-list',
    templateUrl: './offer-list.component.html',
    styleUrls: ['./offer-list.component.scss']
})
export class OfferListComponent implements OnInit {
    @Input() offersIn: Offer[];
    @Input() paginatorIn: Paginator;
    @Input() formOfferIn: FormGroup;
    @Input() displayIn: boolean;
    @Output() offersOut = new EventEmitter<Offer[]>();
    @Output() formOfferOut = new EventEmitter<FormGroup>();
    @Output() displayOut = new EventEmitter<boolean>();
    @Output() paginatorOut = new EventEmitter<Paginator>();
    colsOffer: Col;
    selectedOffers: any[];

    constructor(private messageService: MessageService,
                private spinnerService: NgxSpinnerService,
                private jobBoardHttpService: JobBoardHttpService) {
        this.colsOffer = {header: 'Descripción', field: 'description'};
    }

    ngOnInit(): void {
    }

    searchOffers(event, search) {
        if (event.type === 'click' || event.keyCode === 13 || search.length === 0) {
            const params = search.length > 0 ? new HttpParams().append('search', search) : null;
            this.spinnerService.show();
            this.jobBoardHttpService.get('offers', params).subscribe(response => {
                this.offersIn = response['data'],
                    this.spinnerService.hide();
            }, error => {
                this.spinnerService.hide();
                this.messageService.error(error);
            });
        }
    }

    openNewFormOffer() {
        this.formOfferIn.reset();
        this.formOfferOut.emit(this.formOfferIn);
        this.displayOut.emit(true);
    }

    openEditFormOffer(offer: Offer) {
        this.formOfferIn.patchValue(offer);
        this.formOfferOut.emit(this.formOfferIn);
        this.displayOut.emit(true);
    }

    pageChange(event) {
        this.paginatorIn.current_page = event.page + 1;
        this.paginatorOut.emit(this.paginatorIn);
    }

    deleteOffer(offer: Offer) {
        this.messageService.questionDelete({})
            .then((result) => {
                if (result.isConfirmed) {
                    this.spinnerService.show();
                    this.jobBoardHttpService.delete('offer/delete', {ids: offer.id})
                        .subscribe(response => {
                            this.spinnerService.hide();
                            this.messageService.success(response);
                            this.removeOffer(offer);
                        }, error => {
                            this.spinnerService.hide();
                            this.messageService.error(error);
                        });
                }
            });
    }

    // no se utiliza VERIFICAR DDE NUEVO
    removeOffer(offer: Offer) {
        this.offersIn = this.offersIn.filter(element => element !== offer);
        this.offersOut.emit(this.offersIn);
    }

    // no se utiliza
    deleteOffers() {
        this.messageService.questionDelete({})
            .then((result) => {
                if (result.isConfirmed) {
                    const ids = this.selectedOffers.map(element => element.id);
                    this.spinnerService.show();
                    this.jobBoardHttpService.delete('offer/delete', {ids})
                        .subscribe(response => {
                            this.spinnerService.hide();
                            this.messageService.success(response);
                            this.removeOffers(ids);
                        }, error => {
                            this.spinnerService.hide();
                            this.messageService.error(error);
                        });
                }
            });

    }

    // no se utiliza
    removeOffers(ids) {
        for (const id of ids) {
            this.offersIn = this.offersIn.filter(element => element.id !== id);
        }
        this.offersOut.emit(this.offersIn);
    } 
}