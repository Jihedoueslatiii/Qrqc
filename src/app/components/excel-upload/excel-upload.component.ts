import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-excel-upload',
  templateUrl: './excel-upload.component.html',
  styleUrls: ['./excel-upload.component.css']
})
export class ExcelUploadComponent {
  data: any[] = [];
  objectKeys = Object.keys;
      private toastr: ToastrService | undefined



  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) {
      alert('Please select only one file');
            this.toastr?.success('KPI List importé avec succès !', 'Succès');
      console.error('Cannot use multiple files');
      this.toastr?.error('Please select only one file', 'Error');
      return;
    }

    const file = target.files[0];
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      /* Read data */
      const bstr: string = e.target.result;

      /* Parse workbook */
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* Grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* Convert to JSON */
      this.data = XLSX.utils.sheet_to_json(ws, { defval: '' });


      console.log(this.data);
    };

    reader.readAsBinaryString(file);
  }
}
