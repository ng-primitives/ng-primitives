## 0.54.0 (2025-06-21)

### 🩹 Fixes

- **combobox:** resolve view destroy issue ([#299](https://github.com/ng-primitives/ng-primitives/pull/299))
- **input:** fix form disabled issue ([#302](https://github.com/ng-primitives/ng-primitives/pull/302))
- **overlay:** context injection is now a signal ([#301](https://github.com/ng-primitives/ng-primitives/pull/301))

### ❤️ Thank You

- Ashley Hunter

## 0.53.0 (2025-06-20)

### 🩹 Fixes

- sync state and data-attributes in form-field and form-control - control status ([#298](https://github.com/ng-primitives/ng-primitives/pull/298))

### ❤️ Thank You

- Adrian Kopytko @adriankopytko

## 0.52.0 (2025-06-16)

### 🩹 Fixes

- **combobox:** prevent unexpected scroll ([#296](https://github.com/ng-primitives/ng-primitives/pull/296))

### ❤️ Thank You

- Ashley Hunter

## 0.50.0 (2025-06-06)

### 🚀 Features

- controlled inputs ([#286](https://github.com/ng-primitives/ng-primitives/pull/286))
- **toggle-group:** adding option to allow deselection ([#280](https://github.com/ng-primitives/ng-primitives/pull/280))

### ❤️ Thank You

- Ashley Hunter

## 0.49.0 (2025-06-03)

### 🩹 Fixes

- resolving id sync issues ([#278](https://github.com/ng-primitives/ng-primitives/pull/278))

### ❤️ Thank You

- Ashley Hunter

## 0.48.0 (2025-05-31)

### 🚀 Features

- add support for csp nonce to style injector ([#275](https://github.com/ng-primitives/ng-primitives/pull/275))
- **menu:** reusable component ([#246](https://github.com/ng-primitives/ng-primitives/pull/246), [#149](https://github.com/ng-primitives/ng-primitives/issues/149), [#207](https://github.com/ng-primitives/ng-primitives/issues/207), [#209](https://github.com/ng-primitives/ng-primitives/issues/209), [#204](https://github.com/ng-primitives/ng-primitives/issues/204), [#211](https://github.com/ng-primitives/ng-primitives/issues/211), [#212](https://github.com/ng-primitives/ng-primitives/issues/212), [#214](https://github.com/ng-primitives/ng-primitives/issues/214), [#215](https://github.com/ng-primitives/ng-primitives/issues/215), [#218](https://github.com/ng-primitives/ng-primitives/issues/218), [#219](https://github.com/ng-primitives/ng-primitives/issues/219), [#220](https://github.com/ng-primitives/ng-primitives/issues/220), [#221](https://github.com/ng-primitives/ng-primitives/issues/221), [#222](https://github.com/ng-primitives/ng-primitives/issues/222), [#228](https://github.com/ng-primitives/ng-primitives/issues/228), [#226](https://github.com/ng-primitives/ng-primitives/issues/226), [#237](https://github.com/ng-primitives/ng-primitives/issues/237), [#238](https://github.com/ng-primitives/ng-primitives/issues/238), [#240](https://github.com/ng-primitives/ng-primitives/issues/240), [#243](https://github.com/ng-primitives/ng-primitives/issues/243), [#242](https://github.com/ng-primitives/ng-primitives/issues/242), [#244](https://github.com/ng-primitives/ng-primitives/issues/244), [#152](https://github.com/ng-primitives/ng-primitives/issues/152))

### 🩹 Fixes

- **combobox:** Select input after dropdown opened ([#268](https://github.com/ng-primitives/ng-primitives/pull/268))
- **combobox:** resolve dropdown close issue ([#273](https://github.com/ng-primitives/ng-primitives/pull/273))
- **input:** correct disabled attribute ([#274](https://github.com/ng-primitives/ng-primitives/pull/274))
- **menu:** resolve scroll blocking not working ([#270](https://github.com/ng-primitives/ng-primitives/pull/270))
- **switch:** resolve form control timing issue ([#269](https://github.com/ng-primitives/ng-primitives/pull/269))

### ❤️ Thank You

- Ashley Hunter
- Ruud Walraven

## 0.47.0 (2025-05-29)

### 🩹 Fixes

- **menu:** resolve flicker issue on mobile ([#265](https://github.com/ng-primitives/ng-primitives/pull/265))

### ❤️ Thank You

- Ashley Hunter

## 0.46.0 (2025-05-28)

### 🚀 Features

- **form-control:** add support for standalone form control ([#263](https://github.com/ng-primitives/ng-primitives/pull/263))

### ❤️ Thank You

- Ashley Hunter

## 0.45.1 (2025-05-27)

### 🩹 Fixes

- **menu:** ssr issue ([#261](https://github.com/ng-primitives/ng-primitives/pull/261))

### ❤️ Thank You

- Ashley Hunter

## 0.45.0 (2025-05-26)

- all overlay primitives have now been unified to use the same API internally, greatly simplifying the codebase and making it easier to maintain. This includes the `NgpPopover`, `NgpTooltip`, `NgpMenu`, and `NgpCombobox` primitives.

### 🚨 Breaking Changes

- **menu:** the `NgpMenu` primitives no longer extend the `NgpPopover` primitive. As a result if you had been binding to any `ngpPopover` inputs or outputs, these would need to be updated to use the `ngpMenu` inputs and outputs instead. This also includes any usages of `injectPopoverTriggerState` which should now be replaced with `injectMenuTriggerState`.
The CSS custom property `--ngp-popover-transform-origin` has been replaced with `--ngp-menu-transform-origin` to reflect the new unified API.

If you encounter any other issues related to this change, please raise an issue on GitHub.

## 0.44.0 (2025-05-22)

### 🚀 Features

- add option to disable escape key ([#253](https://github.com/ng-primitives/ng-primitives/pull/253))
- combobox ([#231](https://github.com/ng-primitives/ng-primitives/pull/231))

### ❤️ Thank You

- Ashley Hunter
- kedevked @kedevked

## 0.43.1 (2025-05-21)

### 🩹 Fixes

- **tab:** tab button should be disabled when button element is used ([4debb55](https://github.com/ng-primitives/ng-primitives/commit/4debb55))

### ❤️ Thank You

- Ashley Hunter @ashley-hunter

## 0.43.0 (2025-05-21)

### 🚀 Features

- add popover reusable component ([#251](https://github.com/ng-primitives/ng-primitives/pull/251))
- add .nvmrc ([#254](https://github.com/ng-primitives/ng-primitives/pull/254))

### 🩹 Fixes

- **resize:** support server environments ([#257](https://github.com/ng-primitives/ng-primitives/pull/257))
- **tabs:** support tabs without panels ([#256](https://github.com/ng-primitives/ng-primitives/pull/256))

### ❤️ Thank You

- Ashley Hunter
- Harshit-Prasad @Harshit-Prasad
- kedevked @kedevked

## 0.42.0 (2025-05-19)

### 🩹 Fixes

- **checkbox:** id syncing issue ([#250](https://github.com/ng-primitives/ng-primitives/pull/250))

### ❤️ Thank You

- Ashley Hunter

## 0.41.0 (2025-05-18)

### 🚀 Features

- **file-upload:** filter dropped files by accepted fileTypes and lim… ([#242](https://github.com/ng-primitives/ng-primitives/pull/242))

### 🩹 Fixes

- **popover:** detect changes issue ([#248](https://github.com/ng-primitives/ng-primitives/pull/248))

### ❤️ Thank You

- Ashley Hunter
- Marc Stammerjohann @marcjulian

## 0.40.0 (2025-05-14)

### 🩹 Fixes

- **tooltip:** gracefully handling animation abort ([#240](https://github.com/ng-primitives/ng-primitives/pull/240))

### ❤️ Thank You

- Ashley Hunter

## 0.39.0 (2025-05-12)

### 🩹 Fixes

- **listbox:** resolve focus trap issue ([#238](https://github.com/ng-primitives/ng-primitives/pull/238))

### ❤️ Thank You

- Ashley Hunter

## 0.38.0 (2025-05-03)

### 🚀 Features

- **progress:** adding additional progress primitives ([#222](https://github.com/ng-primitives/ng-primitives/pull/222))

### 🩹 Fixes

- **button:** resolve data-disabled attribute ([#228](https://github.com/ng-primitives/ng-primitives/pull/228))
- **dialog:** resolving focus issue ([#226](https://github.com/ng-primitives/ng-primitives/pull/226))

### ❤️ Thank You

- Ashley Hunter

## 0.37.0 (2025-04-29)

### 🚀 Features

- **dialog:** allow backdrop click to be disabled ([#215](https://github.com/ng-primitives/ng-primitives/pull/215))
- **meter:** adding meter primitive ([#219](https://github.com/ng-primitives/ng-primitives/pull/219))

### 🩹 Fixes

- accessibility issues and adding e2e tests ([#214](https://github.com/ng-primitives/ng-primitives/pull/214))
- **file-upload:** allow same file reupload ([#218](https://github.com/ng-primitives/ng-primitives/pull/218))
- **menu:** menu animation fixes ([#211](https://github.com/ng-primitives/ng-primitives/pull/211))
- **toolbar:** ensure orientation defaults to horizontal ([#212](https://github.com/ng-primitives/ng-primitives/pull/212))

### ❤️ Thank You

- Ashley Hunter

## 0.36.0 (2025-04-26)

### 🚀 Features

- add reusable toolbar component ([#183](https://github.com/ng-primitives/ng-primitives/pull/183))
- add tooltip reusable component ([#198](https://github.com/ng-primitives/ng-primitives/pull/198))
- **menu:** add exit animation support ([#149](https://github.com/ng-primitives/ng-primitives/pull/149), [#206](https://github.com/ng-primitives/ng-primitives/pull/206))
- **popover:** exit animations ([#200](https://github.com/ng-primitives/ng-primitives/pull/200))
- **popover:** popover component support ([#204](https://github.com/ng-primitives/ng-primitives/pull/204))
- **tooltip:** tooltip exit animation ([#201](https://github.com/ng-primitives/ng-primitives/pull/201))

### 🩹 Fixes

- **file-upload:** fixing accepted types ([#209](https://github.com/ng-primitives/ng-primitives/pull/209))
- **radio,tabs:** ensure valueChange events only emit once ([#199](https://github.com/ng-primitives/ng-primitives/pull/199))
- **tooltip:** clear timeouts properly and check view ref after setting open state ([#203](https://github.com/ng-primitives/ng-primitives/pull/203))

### ❤️ Thank You

- Adrian Kopytko @adriankopytko
- Ashley Hunter
- Ayush Seth
- kedevked @kedevked
- Ruud Walraven

## 0.35.0 (2025-04-18)

### 🚀 Features

- **toast:** reusable component ([#192](https://github.com/ng-primitives/ng-primitives/pull/192))

### 🩹 Fixes

- **toast:** ensure toasts always stack ([#195](https://github.com/ng-primitives/ng-primitives/pull/195))

### ❤️ Thank You

- Ashley Hunter

## 0.34.0 (2025-04-16)

### 🚀 Features

- **radio:** adding support for any value type ([#190](https://github.com/ng-primitives/ng-primitives/pull/190))

### ❤️ Thank You

- Ashley Hunter

## 0.33.2 (2025-04-16)

### 🩹 Fixes

- missing dependency ([a552648](https://github.com/ng-primitives/ng-primitives/commit/a552648))

### ❤️ Thank You

- Ashley Hunter

## 0.33.1 (2025-04-15)

### 🚀 Features

- **accordion:** animation support ([#189](https://github.com/ng-primitives/ng-primitives/pull/189))

### ❤️ Thank You

- Ashley Hunter

## 0.33.0 (2025-04-15)

### 🚀 Features

- **file-upload:** dropzone ([#187](https://github.com/ng-primitives/ng-primitives/pull/187))

### 🩹 Fixes

- **dialog:** resolve dialog view container ref issue ([#188](https://github.com/ng-primitives/ng-primitives/pull/188))

### ❤️ Thank You

- Ashley Hunter

## 0.32.0 (2025-04-14)

- documentation api extraction
- dialog reusable component

## 0.31.0 (2025-04-11)

### 🩹 Fixes

- **menu:** resolve open issues on touch devices ([#180](https://github.com/ng-primitives/ng-primitives/pull/180))

### ❤️ Thank You

- Ashley Hunter

## 0.30.0 (2025-04-10)

### 🚀 Features

- enforce state usage ([#172](https://github.com/ng-primitives/ng-primitives/pull/172))

### 🩹 Fixes

- typescript typings paths ([#174](https://github.com/ng-primitives/ng-primitives/pull/174))
- **menu:** avoid submenus being duplicated ([#175](https://github.com/ng-primitives/ng-primitives/pull/175))

### ❤️ Thank You

- Ashley Hunter

## 0.29.0 (2025-04-07)

### 🚀 Features

- adding support for dialog animations ([#143](https://github.com/ng-primitives/ng-primitives/pull/143))
- text area reusable component ([#164](https://github.com/ng-primitives/ng-primitives/pull/164))
- add separator reusable component ([#165](https://github.com/ng-primitives/ng-primitives/pull/165))

### ❤️ Thank You

- Adrian Kopytko @adriankopytko
- Ashley Hunter

## 0.28.0 (2025-04-01)

### 🩹 Fixes

- **popover:** fix sometimes popover trigger is not focused on close ([#140](https://github.com/ng-primitives/ng-primitives/pull/140))

### ❤️ Thank You

- dennis-ackolad @dennis-ackolad

## 0.27.0 (2025-03-27)

### 🚀 Features

- deferred state ([#136](https://github.com/ng-primitives/ng-primitives/pull/136))

### 🩹 Fixes

- re-adding support for nx add ([#137](https://github.com/ng-primitives/ng-primitives/pull/137))

### ❤️ Thank You

- Ashley Hunter

## 0.26.1 (2025-03-23)

### 🩹 Fixes

- **listbox:** dont close popover on multiple selection ([#132](https://github.com/ng-primitives/ng-primitives/pull/132))

### ❤️ Thank You

- Ashley Hunter

## 0.26.0 (2025-03-22)

### 🚀 Features

- form control state ([#123](https://github.com/ng-primitives/ng-primitives/pull/123))
- additional reusable components ([#126](https://github.com/ng-primitives/ng-primitives/pull/126))
- schematics updates ([#127](https://github.com/ng-primitives/ng-primitives/pull/127))
- add primitive state ([#128](https://github.com/ng-primitives/ng-primitives/pull/128))
- tab reusable component ([#129](https://github.com/ng-primitives/ng-primitives/pull/129))
- **nx-cloud:** setup nx cloud workspace ([#130](https://github.com/ng-primitives/ng-primitives/pull/130))

### 🩹 Fixes

- stackblitz stylesheet url ([6751095](https://github.com/ng-primitives/ng-primitives/commit/6751095))

### ❤️ Thank You

- Ashley Hunter

## 0.25.0 (2025-03-13)

### 🚀 Features

- **separator:** adding separator primitive ([#119](https://github.com/ng-primitives/ng-primitives/pull/119))
- **toggle-group:** adding toggle group primitive ([#120](https://github.com/ng-primitives/ng-primitives/pull/120))
- **toolbar:** adding toolbar primitive ([#121](https://github.com/ng-primitives/ng-primitives/pull/121))

### ❤️ Thank You

- Ashley Hunter

## 0.24.0 (2025-03-10)

### 🚀 Features

- **popover:** adding entry animation support ([#118](https://github.com/ng-primitives/ng-primitives/pull/118))

### 🩹 Fixes

- **dialog:** adding missing NgpDialogRef export ([#116](https://github.com/ng-primitives/ng-primitives/pull/116))

### ❤️ Thank You

- Ashley Hunter

## 0.23.0 (2025-03-08)

### 🚀 Features

- **listbox:** listbox trigger interactions ([#111](https://github.com/ng-primitives/ng-primitives/pull/111))
- **popover:** scroll blocking ([#110](https://github.com/ng-primitives/ng-primitives/pull/110))

### ❤️ Thank You

- Ashley Hunter

## 0.22.0 (2025-02-27)

### 🚀 Features

- listbox primitive ([#105](https://github.com/ng-primitives/ng-primitives/pull/105))

### ❤️ Thank You

- Ashley Hunter

## 0.21.0 (2025-02-20)

This was a version bump only, there were no code changes.

## 0.20.0 (2025-02-04)

### 🚀 Features

- **file-upload**: add binding for cancel event

### 🩹 Fixes

- **radio:** fixing generator ([#100](https://github.com/ng-primitives/ng-primitives/pull/100))

### ❤️ Thank You

- Ashley Hunter
- Ayush Seth @ayush-seth

## 0.14.0 (2024-10-31)


### 🚀 Features

- **dialog:** allow opening dialogs using service and allow passing data ([#81](https://github.com/ng-primitives/ng-primitives/pull/81))

### ❤️  Thank You

- Benjamin Forrás @benjaminforras

## 0.13.0 (2024-10-17)


### 🚀 Features

- add the avatar generator ([#77](https://github.com/ng-primitives/ng-primitives/pull/77))

### 🩹 Fixes

- schematics error ([#80](https://github.com/ng-primitives/ng-primitives/pull/80))

### ❤️  Thank You

- Ashley Hunter
- kedevked @kedevked

## 0.12.0 (2024-10-01)

### Breaking Changes

- **data-attributes:** boolean data-attributes are only added when the value is true. This allows for simplified styles by allowing selectors based on presence rather than based on value. ([#75](https://github.com/ng-primitives/ng-primitives/pull/75)

### 🚀 Features

- add accordion generator ([#70](https://github.com/ng-primitives/ng-primitives/pull/70))

### 🩹 Fixes

- change template generated name ([#73](https://github.com/ng-primitives/ng-primitives/pull/73))

### ❤️  Thank You

- kedevked @kedevked

## 0.11.1 (2024-09-28)


### 🩹 Fixes

- **pagination:** making page count optional ([#74](https://github.com/ng-primitives/ng-primitives/pull/74))

### ❤️  Thank You

- Ashley Hunter

## 0.11.0 (2024-09-26)


### 🚀 Features

- add radio generator ([#59](https://github.com/ng-primitives/ng-primitives/pull/59))
- **button:** disabled attribute for generator ([#65](https://github.com/ng-primitives/ng-primitives/pull/65))

### 🩹 Fixes

- **autofill:** resolving ssr issue ([#72](https://github.com/ng-primitives/ng-primitives/pull/72))

### ❤️  Thank You

- Ashley Hunter
- Guillaume G. @IceDevelop74
- kedevked @kedevked

## 0.10.0 (2024-09-13)


### 🚀 Features

- add file-upload generator ([#60](https://github.com/ng-primitives/ng-primitives/pull/60))
- toast primitive ([#63](https://github.com/ng-primitives/ng-primitives/pull/63))
- **popover:** add new popover primitive ([#58](https://github.com/ng-primitives/ng-primitives/pull/58), [#62](https://github.com/ng-primitives/ng-primitives/pull/62))

### 🩹 Fixes

- use kebab case for file name ([#61](https://github.com/ng-primitives/ng-primitives/pull/61))
- focus management ([#57](https://github.com/ng-primitives/ng-primitives/pull/57))

### ❤️  Thank You

- Ashley Hunter
- kedevked @kedevked
- Oto Dočkal @otodockal

## 0.9.0 (2024-09-06)


### 🚀 Features

- add checkbox generator ([#53](https://github.com/ng-primitives/ng-primitives/pull/53))

### 🩹 Fixes

- **focus-visible:** data-focus-visible attribute ([#55](https://github.com/ng-primitives/ng-primitives/pull/55))

### ❤️  Thank You

- kedevked @kedevked
- Oto Dočkal @otodockal

## 0.8.0 (2024-09-03)


### 🚀 Features

- button generator ([#49](https://github.com/ng-primitives/ng-primitives/pull/49))
- schematic generator ([#52](https://github.com/ng-primitives/ng-primitives/pull/52))
- add inputs generator ([#51](https://github.com/ng-primitives/ng-primitives/pull/51))

### ❤️  Thank You

- Ashley Hunter
- kedevked @kedevked

## 0.7.8 (2024-09-02)


### 🩹 Fixes

- **search:** clear signal value ([#45](https://github.com/ng-primitives/ng-primitives/pull/45))

### ❤️  Thank You

- Oto Dočkal @otodockal

## 0.7.7 (2024-08-31)


### 🩹 Fixes

- **dialog:** separate dialog from trigger view ref ([#47](https://github.com/ng-primitives/ng-primitives/pull/47))

### ❤️  Thank You

- Ashley Hunter

## 0.7.6 (2024-08-31)


### 🩹 Fixes

- **tooltip:** tooltip ssr fix ([#46](https://github.com/ng-primitives/ng-primitives/pull/46))

### ❤️  Thank You

- Ashley Hunter

## 0.7.5 (2024-08-30)


### 🩹 Fixes

- **interactions:** ensuring interactions consider disabled state ([#43](https://github.com/ng-primitives/ng-primitives/pull/43))

### ❤️  Thank You

- Ashley Hunter

## 0.7.4 (2024-08-30)


### 🩹 Fixes

- **pagination:** trigger page events with keyboard ([#42](https://github.com/ng-primitives/ng-primitives/pull/42))

### ❤️  Thank You

- Ashley Hunter

## 0.7.3 (2024-08-30)


### 🩹 Fixes

- **pagination:** trigger page events with keyboard ([#42](https://github.com/ng-primitives/ng-primitives/pull/42))

### ❤️  Thank You

- Ashley Hunter

## 0.7.2 (2024-08-24)


### 🩹 Fixes

- **dialog:** resolving merge issue ([#38](https://github.com/ng-primitives/ng-primitives/pull/38))

### ❤️  Thank You

- Ashley Hunter

## 0.7.0 (2024-08-15)


### 🩹 Fixes

- **docs:** Apply darkmode on Algolia searchBar ([#35](https://github.com/ng-primitives/ng-primitives/pull/35))

### ❤️  Thank You

- Yousef Farouk Abodawoud @Abodawoud

## 0.6.1 (2024-08-10)


### 🚀 Features

- **menu:** menu item interactions ([ef466cb](https://github.com/ng-primitives/ng-primitives/commit/ef466cb))

### ❤️  Thank You

- Ashley Hunter @ashley-hunter

## 0.6.0 (2024-08-10)


### 🚀 Features

- **menu:** menu primitive ([#33](https://github.com/ng-primitives/ng-primitives/pull/33))

### 🩹 Fixes

- **docs:** Navbar Right-hand Side Buttons Not Clickable on Mobile ([#32](https://github.com/ng-primitives/ng-primitives/pull/32))

### ❤️  Thank You

- Ashley Hunter
- Benjamin Forrás @benjaminforras

## 0.5.2 (2024-08-06)


### 🩹 Fixes

- ng-add ([#30](https://github.com/ng-primitives/ng-primitives/pull/30))

### ❤️  Thank You

- Ashley Hunter

## 0.5.1 (2024-08-06)


### 🩹 Fixes

- adding missing generators file ([#29](https://github.com/ng-primitives/ng-primitives/pull/29))

### ❤️  Thank You

- Ashley Hunter

## 0.5.0 (2024-08-05)

### 🚀 Features

- pagination ([#23](https://github.com/ng-primitives/ng-primitives/pull/23))
- **docs:** implement dark mode ([#17](https://github.com/ng-primitives/ng-primitives/pull/17))

### ❤️ Thank You

- Ashley Hunter
- Benjamin Forrás @benjaminforras

## 0.4.0 (2024-07-31)

### 🚀 Features

- date picker ([#12](https://github.com/ng-primitives/ng-primitives/pull/12))

### ❤️ Thank You

- Ashley Hunter

## 0.3.0 (2024-07-26)

### 🚀 Features

- **search-clear:** add search field clear primitive ([5274e86](https://github.com/ng-primitives/ng-primitives/commit/5274e86))

### ❤️ Thank You

- Matteo Nista

## 0.2.1 (2024-07-25)

### 🩹 Fixes

- **tabs:** moving tab panel visibility to user space ([21f619e](https://github.com/ng-primitives/ng-primitives/commit/21f619e))

### ❤️ Thank You

- Ashley Hunter @ashley-hunter

## 0.2.0 (2024-07-24)

### 🩹 Fixes

- add search field primitive ([4898b19](https://github.com/ng-primitives/ng-primitives/commit/4898b19))
- **tabs:** moving tab panel visibility to user space ([21f619e](https://github.com/ng-primitives/ng-primitives/commit/21f619e))
- **accordion:** adding animation support ([31d4b1b](https://github.com/ng-primitives/ng-primitives/commit/31d4b1b))

### ❤️ Thank You

- Ashley Hunter @ashley-hunter

## 0.1.0 (2024-07-22)

Our first pre-release! 🎉
