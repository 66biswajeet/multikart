"use client";
import { Formik, Form, Field } from "formik";
import { AllCountryCode } from "@/data/AllCountryCode";

// Country code to full name mapping
const countryCodeToName = {
  ae: "United Arab Emirates",
  qa: "Qatar",
  om: "Oman",
  bh: "Bahrain",
  kw: "Kuwait",
  ma: "Morocco",
  af: "Afghanistan",
  al: "Albania",
  dz: "Algeria",
  as: "American Samoa",
  ad: "Andorra",
  ao: "Angola",
  ai: "Anguilla",
  ag: "Antigua and Barbuda",
  ar: "Argentina",
  am: "Armenia",
  aw: "Aruba",
  au: "Australia",
  at: "Austria",
  az: "Azerbaijan",
  bs: "Bahamas",
  bd: "Bangladesh",
  bb: "Barbados",
  by: "Belarus",
  be: "Belgium",
  bz: "Belize",
  bj: "Benin",
  bm: "Bermuda",
  bt: "Bhutan",
  bo: "Bolivia",
  ba: "Bosnia and Herzegovina",
  bw: "Botswana",
  br: "Brazil",
  io: "British Indian Ocean Territory",
  vg: "British Virgin Islands",
  bn: "Brunei",
  bg: "Bulgaria",
  bf: "Burkina Faso",
  bi: "Burundi",
  kh: "Cambodia",
  cm: "Cameroon",
  ca: "Canada",
  cv: "Cape Verde",
  bq: "Caribbean Netherlands",
  ky: "Cayman Islands",
  cf: "Central African Republic",
  td: "Chad",
  cl: "Chile",
  cn: "China",
  cx: "Christmas Island",
  cc: "Cocos (Keeling) Islands",
  co: "Colombia",
  km: "Comoros",
  cd: "Congo (DRC)",
  cg: "Congo (Republic)",
  ck: "Cook Islands",
  cr: "Costa Rica",
  ci: "Côte d’Ivoire",
  hr: "Croatia",
  cu: "Cuba",
  cw: "Curaçao",
  cy: "Cyprus",
  cz: "Czechia",
  dk: "Denmark",
  dj: "Djibouti",
  dm: "Dominica",
  do: "Dominican Republic",
  ec: "Ecuador",
  eg: "Egypt",
  sv: "El Salvador",
  gq: "Equatorial Guinea",
  er: "Eritrea",
  ee: "Estonia",
  et: "Ethiopia",
  fk: "Falkland Islands",
  fo: "Faroe Islands",
  fj: "Fiji",
  fi: "Finland",
  fr: "France",
  ga: "Gabon",
  gm: "Gambia",
  ge: "Georgia",
  de: "Germany",
  gh: "Ghana",
  gi: "Gibraltar",
  gr: "Greece",
  gl: "Greenland",
  gd: "Grenada",
  gp: "Guadeloupe",
  gu: "Guam",
  gt: "Guatemala",
  gg: "Guernsey",
  gn: "Guinea",
  gw: "Guinea-Bissau",
  gy: "Guyana",
  ht: "Haiti",
  hn: "Honduras",
  hk: "Hong Kong",
  hu: "Hungary",
  is: "Iceland",
  in: "India",
  id: "Indonesia",
  ir: "Iran",
  iq: "Iraq",
  ie: "Ireland",
  im: "Isle of Man",
  il: "Israel",
  it: "Italy",
  jm: "Jamaica",
  jp: "Japan",
  je: "Jersey",
  jo: "Jordan",
  kz: "Kazakhstan",
  ke: "Kenya",
  ki: "Kiribati",
  xk: "Kosovo",
  kw: "Kuwait",
  kg: "Kyrgyzstan",
  la: "Laos",
  lv: "Latvia",
  lb: "Lebanon",
  ls: "Lesotho",
  lr: "Liberia",
  ly: "Libya",
  li: "Liechtenstein",
  lt: "Lithuania",
  lu: "Luxembourg",
  mo: "Macao",
  mk: "North Macedonia",
  mg: "Madagascar",
  mw: "Malawi",
  my: "Malaysia",
  mv: "Maldives",
  ml: "Mali",
  mt: "Malta",
  mh: "Marshall Islands",
  mq: "Martinique",
  mr: "Mauritania",
  mu: "Mauritius",
  yt: "Mayotte",
  mx: "Mexico",
  fm: "Micronesia",
  md: "Moldova",
  mc: "Monaco",
  mn: "Mongolia",
  me: "Montenegro",
  ms: "Montserrat",
  ma: "Morocco",
  mz: "Mozambique",
  mm: "Myanmar",
  na: "Namibia",
  nr: "Nauru",
  np: "Nepal",
  nl: "Netherlands",
  nc: "New Caledonia",
  nz: "New Zealand",
  ni: "Nicaragua",
  ne: "Niger",
  ng: "Nigeria",
  nu: "Niue",
  nf: "Norfolk Island",
  kp: "North Korea",
  mp: "Northern Mariana Islands",
  no: "Norway",
  om: "Oman",
  pk: "Pakistan",
  pw: "Palau",
  ps: "Palestine",
  pa: "Panama",
  pg: "Papua New Guinea",
  py: "Paraguay",
  pe: "Peru",
  ph: "Philippines",
  pl: "Poland",
  pt: "Portugal",
  pr: "Puerto Rico",
  qa: "Qatar",
  re: "Réunion",
  ro: "Romania",
  ru: "Russia",
  rw: "Rwanda",
  bl: "Saint Barthélemy",
  sh: "Saint Helena",
  kn: "Saint Kitts and Nevis",
  lc: "Saint Lucia",
  mf: "Saint Martin",
  pm: "Saint Pierre and Miquelon",
  vc: "Saint Vincent and the Grenadines",
  ws: "Samoa",
  sm: "San Marino",
  st: "Sao Tome and Principe",
  sa: "Saudi Arabia",
  sn: "Senegal",
  rs: "Serbia",
  sc: "Seychelles",
  sl: "Sierra Leone",
  sg: "Singapore",
  sx: "Sint Maarten",
  sk: "Slovakia",
  si: "Slovenia",
  sb: "Solomon Islands",
  so: "Somalia",
  za: "South Africa",
  kr: "South Korea",
  ss: "South Sudan",
  es: "Spain",
  lk: "Sri Lanka",
  sd: "Sudan",
  sr: "Suriname",
  sj: "Svalbard and Jan Mayen",
  sz: "Eswatini",
  se: "Sweden",
  ch: "Switzerland",
  sy: "Syria",
  tw: "Taiwan",
  tj: "Tajikistan",
  tz: "Tanzania",
  th: "Thailand",
  tl: "Timor-Leste",
  tg: "Togo",
  tk: "Tokelau",
  to: "Tonga",
  tt: "Trinidad and Tobago",
  tn: "Tunisia",
  tr: "Turkey",
  tm: "Turkmenistan",
  tc: "Turks and Caicos Islands",
  tv: "Tuvalu",
  vi: "U.S. Virgin Islands",
  ug: "Uganda",
  ua: "Ukraine",
  ae: "United Arab Emirates",
  gb: "United Kingdom",
  us: "United States",
  uy: "Uruguay",
  uz: "Uzbekistan",
  vu: "Vanuatu",
  va: "Vatican City",
  ve: "Venezuela",
  vn: "Vietnam",
  wf: "Wallis and Futuna",
  eh: "Western Sahara",
  ye: "Yemen",
  zm: "Zambia",
  zw: "Zimbabwe",
  ax: "Åland Islands",
};
import * as Yup from "yup";

const schema = Yup.object({
  payout: Yup.object({
    bank_name: Yup.string().required("Required"),
    account_number: Yup.string().required("Required"),
    account_holder_name: Yup.string().required("Required"),
    country: Yup.string().required("Required"),
    bank_address: Yup.string().required("Required"),
    swift_code: Yup.string(),
  }),
});

export default function Step4Payout({ onSubmit, initialData }) {
  const initialValues = {
    payout: {
      bank_name: initialData?.payout?.bank_name || "",
      account_number: initialData?.payout?.account_number || "",
      account_holder_name: initialData?.payout?.account_holder_name || "",
      country: initialData?.payout?.country || "Maldives",
      bank_address: initialData?.payout?.bank_address || "",
      swift_code: initialData?.payout?.swift_code || "",
    },
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      <Form className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Bank Name</label>
          <Field name="payout.bank_name" className="form-control" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Account Number</label>
          <Field name="payout.account_number" className="form-control" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Account Holder Name</label>
          <Field name="payout.account_holder_name" className="form-control" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Country</label>
          <Field as="select" name="payout.country" className="form-control">
            {/* Maldives always on top */}
            <option key="Maldives" value="Maldives">
              Maldives
            </option>
            {AllCountryCode &&
              AllCountryCode.filter((c) => c.data && c.data.class !== "mv").map(
                (country) => {
                  const code = country.data.class.toLowerCase();
                  const name = countryCodeToName[code] || code.toUpperCase();
                  return (
                    <option key={country.data.class} value={country.data.class}>
                      {name}
                    </option>
                  );
                }
              )}
          </Field>
        </div>
        <div className="col-md-4">
          <label className="form-label">Bank Address</label>
          <Field
            name="payout.bank_address"
            className="form-control"
            placeholder="Enter Bank Address"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">SWIFT Code</label>
          <Field name="payout.swift_code" className="form-control" />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Save & Continue
          </button>
        </div>
      </Form>
    </Formik>
  );
}
