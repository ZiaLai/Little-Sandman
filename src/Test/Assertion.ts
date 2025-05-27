
export class Assertion {
    public static assert(expectedResult: boolean, testString: string): string {
       if (expectedResult) {
           return "Test successfull";
       }
       else {
           throw new Error(`Assertion assertion failed: ${testString}`);
       }

    }
}