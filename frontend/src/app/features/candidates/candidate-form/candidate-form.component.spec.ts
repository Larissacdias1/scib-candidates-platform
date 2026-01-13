import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { Router } from "@angular/router";
import { of, throwError } from "rxjs";
import { CandidateFormComponent } from "./candidate-form.component";
import { CandidatesStore } from "@app/core/state/candidates.store";

describe("CandidateFormComponent", () => {
  let component: CandidateFormComponent;
  let fixture: ComponentFixture<CandidateFormComponent>;
  let storeSpy: jest.Mocked<CandidatesStore>;
  let routerSpy: jest.Mocked<Router>;

  const mockCandidate = {
    id: "1",
    name: "Test",
    surname: "User",
    seniority: "junior" as const,
    yearsOfExperience: 1,
    availability: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    storeSpy = {
      createCandidate: jest.fn(),
    } as unknown as jest.Mocked<CandidatesStore>;

    routerSpy = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [CandidateFormComponent, NoopAnimationsModule],
      providers: [
        { provide: CandidatesStore, useValue: storeSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe("form validation", () => {
    it("requires name field", () => {
      const control = component.form.get("name");
      control?.setValue("");
      expect(control?.hasError("required")).toBe(true);
    });

    it("requires surname field", () => {
      const control = component.form.get("surname");
      control?.setValue("");
      expect(control?.hasError("required")).toBe(true);
    });

    it("enforces max length of 100 characters", () => {
      const control = component.form.get("name");
      control?.setValue("a".repeat(101));
      expect(control?.hasError("maxlength")).toBe(true);
    });
  });

  describe("file upload", () => {
    it("accepts valid Excel files", () => {
      const file = new File([""], "data.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const event = { target: { files: [file] } } as unknown as Event;
      component.onFileSelected(event);

      expect(component.selectedFile).toBe(file);
      expect(component.fileError).toBeNull();
    });

    it("rejects non-Excel files", () => {
      const file = new File([""], "document.pdf", { type: "application/pdf" });

      const event = { target: { files: [file] } } as unknown as Event;
      component.onFileSelected(event);

      expect(component.selectedFile).toBeNull();
      expect(component.fileError).toBeTruthy();
    });

    it("clears selected file", () => {
      component.selectedFile = new File([""], "data.xlsx");

      const event = { stopPropagation: jest.fn() } as unknown as Event;
      component.onClearFile(event);

      expect(component.selectedFile).toBeNull();
    });
  });

  describe("form submission", () => {
    beforeEach(() => {
      component.form.setValue({ name: "Test", surname: "User" });
      component.selectedFile = new File([""], "data.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    });

    it("creates candidate and navigates on success", fakeAsync(() => {
      storeSpy.createCandidate.mockReturnValue(of(mockCandidate));

      component.onSubmit();
      tick();

      expect(storeSpy.createCandidate).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(["/candidates"]);
    }));

    it("handles submission errors gracefully", fakeAsync(() => {
      storeSpy.createCandidate.mockReturnValue(
        throwError(() => new Error("Server error"))
      );

      component.onSubmit();
      tick();

      expect(component.submitting).toBe(false);
    }));

    it("prevents submission with invalid form", () => {
      component.form.setValue({ name: "", surname: "" });

      component.onSubmit();

      expect(storeSpy.createCandidate).not.toHaveBeenCalled();
    });
  });
});
