import { LightningElement,wire,track,api} from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import GENDER_IDENTITY_FIELD from '@salesforce/schema/contact.GenderIdentity';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import saveMultipleContacts from '@salesforce/apex/addMultipleContactsController.saveMultipleContacts';

export default class AddMulConToAccount extends LightningElement {
    @api recordId
        @track contacts = []

        @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
        contactObjectInfo;
    
        @wire(getPicklistValues, { recordTypeId: '$contactObjectInfo.data.defaultRecordTypeId', fieldApiName: GENDER_IDENTITY_FIELD })
        wiredGenderPicklistValues;


        get genderPicklistValues(){
            console.log(this.wiredGenderPicklistValues.data);
            return this.wiredGenderPicklistValues ?.data?.values
        }

        addNewClickHandler(){
            this.contacts.push({
                tempId: Date.now()
               })
        }

        deleteRow(event){
            if(this.contacts.length == 1){
                this.showToast('you cannot delete only 1 row');
                return;
            }
            let rowId = event.target?.dataset?.tempId;
            this.contacts = this.contacts.filter(a=>a.tempId != rowId);

        }
        onValueChange(event){
            console.log('event--->',event);
            console.log('event.target.value===>',event.target.value);
            let contactRow = this.contacts.find(a => a.tempId == event.target.dataset.tempId);
            if(contactRow){
                contactRow[event.target.name] = event.target?.value;
            }
            console.log('contactRow====>',contactRow);
        }

        
        showToast(message, title = 'Error', variant = 'error') {
                const event = new ShowToastEvent({
                    title,
                    message,
                    variant
                });
                this.dispatchEvent(event);
            }

         async submitClickHandler(){
            console.log('inside submitClickhandler')
            let allvalidbox = this.checkValidity();

            if(allvalidbox){

                this.contacts.forEach(a=>a.AccountId = this.recordId);
                console.log('contacts--->',this.contacts);
                let response = await saveMultipleContacts({contacts : this.contacts});
                if(response.isSuccess){
                    this.showToast('Records created successfully','Success','Success');
                    this.dispatchEvent(CloseActionScreenEvent);
                }else{
                    this.showToast('Something went wrong while saving contacts - ' + response.message);
                }

              }else{
                this.showToast('Please processed with below error:');
              }
            }

        checkValidity(){
            let valid = true;
            let controls = this.template.querySelectorAll('ligthning-input','lightning-combobox');
            controls.forEach(element => {

                if(!element.checkValidity()){
                    element.reportValidity();
                    valid = false;
                }
                
            });
            return valid;
        }

        connectedCallback(){
           this.addNewClickHandler();
        }
}