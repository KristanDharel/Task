import { Field } from "formik";
import React from "react";

const FormikInput = ({ name, label, type, onChange, required, ...props }) => {
  return (
    <div>
      <Field name={name}>
        {({ field, form, meta }) => {
          return (
            <div>
              <label htmlFor={name}>
                {label}{" "}
                {required ? <span style={{ color: "red" }}>*</span> : null}
              </label>
              <input
                {...props}
                {...field}
                // id="name"
                type={type}
                value={meta.value}
                onChange={onChange ? onChange : field.onChange}
              />

              {meta.touched && meta.error ? (
                <div style={{ color: "red" }}>{meta.error}</div> //meta.touch help to focus that field to run the validation
              ) : //validation will run only if onChange event is fired
              //onBlur (touched) is fired
              //and onSubmit
              null}
            </div>
          );
        }}
      </Field>
    </div>
  );
};

export default FormikInput;
