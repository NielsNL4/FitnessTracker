// Presentation only: filtering continues to use the catalog's raw muscle values.
export const exerciseGroups = [
 {label:'Buik',targets:['abs']},
 {label:'Borst',targets:['pectorals','serratus anterior']},
 {label:'Rug',targets:['lats','upper back','spine','traps']},
 {label:'Schouders',targets:['delts']},
 {label:'Armen',targets:['biceps','triceps','forearms']},
 {label:'Benen en billen',targets:['quads','hamstrings','glutes','calves','adductors','abductors']},
 {label:'Nek',targets:['levator scapulae']},
 {label:'Cardio',targets:['cardiovascular system']},
 {label:'Overig',targets:[]},
];

export const muscleLabels: Record<string,string> = {
 abs:'Buikspieren',
 pectorals:'Borstspieren',
 'serratus anterior':'Voorste zaagspier',
 lats:'Brede rugspier',
 'upper back':'Bovenrug',
 spine:'Onderrug',
 traps:'Monnikskapspier',
 delts:'Schouders',
 biceps:'Biceps',
 triceps:'Triceps',
 forearms:'Onderarmen',
 quads:'Quadriceps',
 hamstrings:'Hamstrings',
 glutes:'Bilspieren',
 calves:'Kuiten',
 adductors:'Binnenkant bovenbeen',
 abductors:'Buitenkant bovenbeen',
 'levator scapulae':'Schouderbladheffer (nek)',
 'cardiovascular system':'Hart en bloedsomloop',
};
