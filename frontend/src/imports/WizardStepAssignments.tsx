import svgPaths from "./svg-l33w9nfv0c";

function Heading() {
  return (
    <div className="content-stretch flex h-[36px] items-start relative shrink-0 w-full" data-name="Heading 2">
      <p className="basis-0 font-['Inter:Bold',sans-serif] font-bold grow leading-[36px] min-h-px min-w-px not-italic relative shrink-0 text-[#0f172b] text-[30px] tracking-[-0.75px]">Assignment Management</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[22.734px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#45556c] text-[14px] text-nowrap top-px tracking-[-0.32px] whitespace-pre">Configure assignments for each stage. One stage can have multiple assignments, and each assignment can have multiple leaders.</p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.984px] h-[62.719px] items-start left-[31.99px] top-[31.99px] w-[1483.52px]" data-name="Container">
      <Heading />
      <Paragraph />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[22.734px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.75px] left-0 not-italic text-[#45556c] text-[14px] text-nowrap top-px tracking-[-0.35px] whitespace-pre">All Stage</p>
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.5)] h-[46.945px] left-0 rounded-3xl top-0 w-[422.016px]" data-name="Text Input">
      <div className="content-stretch flex h-[46.945px] items-center overflow-clip pl-[40px] pr-[16px] py-[10px] relative rounded-[inherit] w-[422.016px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#90a1b9] text-[16px] text-nowrap tracking-[-0.32px] whitespace-pre">Search by name or department...</p>
      </div>
      <div aria-hidden="true" className="absolute border-[1.5px] border-slate-200 border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[15.98px] size-[15.984px] top-[15.47px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p29a7b2c0} id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33203" />
          <path d={svgPaths.p1cb72580} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33203" />
        </g>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[46.945px] relative shrink-0 w-full" data-name="Container">
      <TextInput />
      <Icon />
    </div>
  );
}

function WizardStepAssignments() {
  return (
    <div className="h-[81.68px] relative shrink-0 w-[422.016px]" data-name="WizardStepAssignments">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] h-[81.68px] items-start relative w-[422.016px]">
        <Paragraph1 />
        <Container1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="opacity-10 relative shrink-0 size-[19.992px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid size-[19.992px]" />
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[27.984px] relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-nowrap text-white top-[-1.5px] tracking-[-0.32px] whitespace-pre">New Stage</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[22.734px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.9)] top-px tracking-[-0.32px] w-[215px]">14 days • 8/12/2025 - 22/12/2025</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="basis-0 grow h-[54.703px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.984px] h-[54.703px] items-start relative w-full">
        <Heading1 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function WizardStepAssignments1() {
  return (
    <div className="absolute content-stretch flex gap-[15.984px] h-[54.703px] items-center left-[24px] top-[24px] w-[351.516px]" data-name="WizardStepAssignments">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 h-[102.703px] relative rounded-2xl shadow-lg to-purple-600 w-full" data-name="Button">
      <WizardStepAssignments1 />
    </div>
  );
}

function Container4() {
  return (
    <div className="opacity-10 relative shrink-0 size-[19.992px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid size-[19.992px]" />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[27.984px] relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] text-nowrap top-[-1.5px] tracking-[-0.32px] whitespace-pre">New Stage</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[22.734px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#45556c] text-[14px] top-px tracking-[-0.32px] w-[207px]">14 days • 23/12/2025 - 6/1/2026</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="basis-0 grow h-[54.703px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.984px] h-[54.703px] items-start relative w-full">
        <Heading2 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function WizardStepAssignments2() {
  return (
    <div className="absolute content-stretch flex gap-[15.984px] h-[54.703px] items-center left-[24px] top-[24px] w-[351.516px]" data-name="WizardStepAssignments">
      <Container4 />
      <Container5 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-slate-100 h-[102.703px] relative rounded-2xl shrink-0 w-full" data-name="Button">
      <WizardStepAssignments2 />
    </div>
  );
}

function Container6() {
  return (
    <div className="opacity-10 relative shrink-0 size-[19.992px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid size-[19.992px]" />
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[27.984px] relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] text-nowrap top-[-1.5px] tracking-[-0.32px] whitespace-pre">New Stage</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[22.734px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#45556c] text-[14px] top-px tracking-[-0.32px] w-[195px]">14 days • 7/1/2026 - 21/1/2026</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="basis-0 grow h-[54.703px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.984px] h-[54.703px] items-start relative w-full">
        <Heading3 />
        <Paragraph4 />
      </div>
    </div>
  );
}

function WizardStepAssignments3() {
  return (
    <div className="absolute content-stretch flex gap-[15.984px] h-[54.703px] items-center left-[24px] top-[24px] w-[351.516px]" data-name="WizardStepAssignments">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-slate-100 h-[102.703px] relative rounded-2xl shrink-0 w-full" data-name="Button">
      <WizardStepAssignments3 />
    </div>
  );
}

function Container8() {
  return (
    <div className="opacity-10 relative shrink-0 size-[19.992px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid size-[19.992px]" />
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[27.984px] relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] text-nowrap top-[-1.5px] tracking-[-0.32px] whitespace-pre">New Stage</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[22.734px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#45556c] text-[14px] top-px tracking-[-0.32px] w-[201px]">14 days • 22/1/2026 - 5/2/2026</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="basis-0 grow h-[54.703px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.984px] h-[54.703px] items-start relative w-full">
        <Heading4 />
        <Paragraph5 />
      </div>
    </div>
  );
}

function WizardStepAssignments4() {
  return (
    <div className="absolute content-stretch flex gap-[15.984px] h-[54.703px] items-center left-[24px] top-[24px] w-[351.516px]" data-name="WizardStepAssignments">
      <Container8 />
      <Container9 />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-slate-100 h-[102.703px] relative rounded-2xl shrink-0 w-full" data-name="Button">
      <WizardStepAssignments4 />
    </div>
  );
}

function Container10() {
  return (
    <div className="opacity-10 relative shrink-0 size-[19.992px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid size-[19.992px]" />
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[27.984px] relative shrink-0 w-full" data-name="Heading 4">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] text-nowrap top-[-1.5px] tracking-[-0.32px] whitespace-pre">New Stage</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[22.734px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.75px] left-0 not-italic text-[#45556c] text-[14px] top-px tracking-[-0.32px] w-[205px]">14 days • 6/2/2026 - 20/2/2026</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="basis-0 grow h-[54.703px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.984px] h-[54.703px] items-start relative w-full">
        <Heading5 />
        <Paragraph6 />
      </div>
    </div>
  );
}

function WizardStepAssignments5() {
  return (
    <div className="absolute content-stretch flex gap-[15.984px] h-[54.703px] items-center left-[24px] top-[24px] w-[351.516px]" data-name="WizardStepAssignments">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-slate-100 h-[102.703px] relative rounded-2xl shrink-0 w-full" data-name="Button">
      <WizardStepAssignments5 />
    </div>
  );
}

function WizardStepAssignments6() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[422.016px]" data-name="WizardStepAssignments">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.992px] h-full items-start overflow-clip pl-0 pr-[22.5px] py-0 relative rounded-[inherit] w-[422.016px]">
        <Button />
        <Button1 />
        <Button2 />
        <Button3 />
        <Button4 />
      </div>
    </div>
  );
}

function GlassCard() {
  return (
    <div className="bg-[rgba(255,255,255,0.95)] h-[377.672px] relative rounded-2xl shrink-0 w-[459.984px]" data-name="GlassCard">
      <div aria-hidden="true" className="absolute border-[1.5px] border-[rgba(148,163,184,0.3)] border-solid inset-0 pointer-events-none rounded-2xl shadow-xl" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[15.984px] h-[377.672px] items-start pl-[18.984px] pr-[1.5px] py-[18.984px] relative w-[459.984px]">
        <WizardStepAssignments />
        <WizardStepAssignments6 />
      </div>
      <div className="absolute inset-0 pointer-events-none shadow-[0px_1px_0px_0px_inset_rgba(255,255,255,0.8)]" />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[12px] size-[15.984px] top-[7.99px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33008 7.99219H12.6543" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33203" />
          <path d="M7.99219 3.33008V12.6543" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33203" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute bg-gradient-to-r from-indigo-600 h-[31.969px] left-[812.3px] rounded-2xl shadow-lg to-purple-600 top-[25.5px] w-[161.742px]" data-name="Button">
      <Icon1 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[97.47px] not-italic text-[14px] text-center text-nowrap text-white top-[6.5px] tracking-[-0.32px] translate-x-[-50%] whitespace-pre">Add Assignment</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[98.46px] size-[48px] top-0" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          <path d={svgPaths.p2b3c4500} id="Vector" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          <path d={svgPaths.pa398c00} id="Vector_2" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          <path d={svgPaths.p39ff1860} id="Vector_3" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          <path d={svgPaths.p31eb3600} id="Vector_4" stroke="var(--stroke-0, #90A1B9)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[25.992px] left-0 top-[60px] w-[244.945px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[26px] left-[122.5px] not-italic text-[#45556c] text-[16px] text-center text-nowrap top-[-1px] tracking-[-0.32px] translate-x-[-50%] whitespace-pre">No assignments yet for this stage</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[15.98px] size-[15.984px] top-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M3.33008 7.99219H12.6543" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33203" />
          <path d="M7.99219 3.33008V12.6543" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33203" />
        </g>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute bg-gradient-to-r from-indigo-600 h-[39.984px] left-[11.74px] rounded-3xl shadow-lg to-purple-600 top-[101.98px] w-[221.461px]" data-name="Button">
      <Icon3 />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[127.45px] not-italic text-[16px] text-center text-nowrap text-white top-[6.49px] tracking-[-0.32px] translate-x-[-50%] whitespace-pre">Add First Assignment</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[141.961px] relative shrink-0 w-full" data-name="Container">
      <Icon2 />
      <Paragraph7 />
      <Button6 />
    </div>
  );
}

function WizardStepAssignments7() {
  return (
    <div className="absolute content-stretch flex flex-col h-[270.703px] items-start left-[25.5px] overflow-clip pb-0 pt-[64.359px] px-[351.797px] top-[81.47px] w-[948.539px]" data-name="WizardStepAssignments">
      <Container12 />
    </div>
  );
}

function GlassCard1() {
  return (
    <div className="basis-0 bg-[rgba(255,255,255,0.95)] grow h-[377.672px] min-h-px min-w-px relative rounded-2xl shrink-0" data-name="GlassCard">
      <div aria-hidden="true" className="absolute border-[1.5px] border-[rgba(148,163,184,0.3)] border-solid inset-0 pointer-events-none rounded-2xl shadow-xl" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[377.672px] relative w-full">
        <Button5 />
        <WizardStepAssignments7 />
      </div>
      <div className="absolute inset-0 pointer-events-none shadow-[0px_1px_0px_0px_inset_rgba(255,255,255,0.8)]" />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex gap-[24px] h-[409.664px] items-start left-0 overflow-clip px-[31.992px] py-0 top-[142.71px] w-[1547.51px]" data-name="Container">
      <GlassCard />
      <GlassCard1 />
    </div>
  );
}

export default function WizardStepAssignments8() {
  return (
    <div className="relative size-full" data-name="WizardStepAssignments">
      <Container />
      <Container13 />
    </div>
  );
}