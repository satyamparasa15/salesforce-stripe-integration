import { LightningElement, wire, track, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getProducts from '@salesforce/apex/StripePaymentHelper.getOpportunityLineItems';
import sendPaymentRequest from '@salesforce/apex/StripePaymentHelper.sendPaymentRequest';

export default class StripePaymentCmp extends LightningElement {

    error;
    records;
    totalPrice = 0;
    recordId;
    isProcess;
    isDisabled;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.recordId = currentPageReference.state.recordId;
            if (this.recordId) {
                getProducts({ parentId: this.recordId }).then((result) => {
                    let totalProductsPrice = 0;
                    result.forEach(prod => {
                        totalProductsPrice += prod.TotalPrice;
                    });
                    this.totalPrice = "Pay($" + totalProductsPrice + ")";
                    this.records = result;
                }).catch((error) => {
                    console.log('results error is ' + JSON.stringify(error));
                });
            }
        }
    }


    handlePay() {
        this.isProcess = true;
        this.isDisabled = true;
        const dataJson = JSON.stringify(this.records);
        sendPaymentRequest({ productsJson: dataJson }).then((result) => {
            this.isProcess = false;
            this.showToastMessage('Request Success', 'Payment request sucessfully sent', 'success');
        }).catch((error) => {
            this.isProcess = false;
            this.isDisabled = false;
            this.showToastMessage('Request Error', 'Something went wrong' + error, 'error');
        });
    }

    showToastMessage(title, mes, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: mes,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }


}