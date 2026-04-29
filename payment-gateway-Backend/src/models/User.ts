
export class User {

    
    private _name: string;
    private _accountNumber: string;
    private _userId: string;
    private _mpin: number;
    private _password: string;
    private _phoneNumber: string;

    
    constructor(
        name: string,
        accountNumber: string,
        userId: string,
        mpin: number,
        password: string,
        phoneNumber: string
    ) {
        this._name = name;
        this._accountNumber = accountNumber;
        this._userId = userId;
        this._mpin = mpin;
        this._password = password;
        this._phoneNumber = phoneNumber;
    }

    

    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }

    get accountNumber(): string {
        return this._accountNumber;
    }
    set accountNumber(value: string) {
        this._accountNumber = value;
    }

    get userId(): string {
        return this._userId;
    }
    set userId(value: string) {
        this._userId = value;
    }

    get mpin(): number {
        return this._mpin;
    }
    set mpin(value: number) {
        this._mpin = value;
    }

    get password(): string {
        return this._password;
    }
    set password(value: string) {
        this._password = value;
    }

    get phoneNumber(): string {
        return this._phoneNumber;
    }
    set phoneNumber(value: string) {
        this._phoneNumber = value;
    }

   
    validateMpin(enteredMpin: number): boolean {
        return this._mpin === enteredMpin;
    }

   
    validatePassword(enteredPassword: string): boolean {
        return this._password === enteredPassword;
    }

    
    toDisplayString(): string {
        return `User: ${this._name} | Account: ${this._accountNumber} | Phone: ${this._phoneNumber}`;
    }
}
