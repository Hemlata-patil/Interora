import React from 'react';
import { PageHeader, Card, Button, ProgressBar, Badge } from '@/components';
import { BookOpen, Code, Terminal, MessageSquare, PlayCircle, FileText, CheckCircle2, Target, Video, Briefcase, Zap } from 'lucide-react';

const mockSkills = [
  { name: 'JavaScript', level: 'Advanced', progress: 85, icon: Terminal, color: 'text-yellow-600', bg: 'bg-yellow-100', description: 'Master advanced concepts and asynchronous programming.', isFree: true, resourceType: 'Video Course', linkText: 'Watch Free Course', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { name: 'React', level: 'Intermediate', progress: 70, icon: Code, color: 'text-cyan-600', bg: 'bg-cyan-100', description: 'Learn hooks, context, and state management.', isFree: true, resourceType: 'Interactive Tutorial', linkText: 'Start Learning', url: 'https://react.dev/learn' },
  { name: 'HTML/CSS', level: 'Advanced', progress: 95, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100', description: 'Advanced responsive design and CSS Grid/Flexbox.', isFree: true, resourceType: 'Free Guide', linkText: 'Read Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
  { name: 'Git & GitHub', level: 'Intermediate', progress: 65, icon: Terminal, color: 'text-slate-600', bg: 'bg-slate-100', description: 'Version control and collaboration best practices.', isFree: true, resourceType: 'Free Documentation', linkText: 'Read Docs', url: 'https://skills.github.com/' },
  { name: 'Communication', level: 'Intermediate', progress: 80, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100', description: 'Effective professional communication for engineers.', isFree: true, resourceType: 'YouTube Playlist', linkText: 'Watch Videos', url: 'https://www.youtube.com/results?search_query=professional+communication+skills' }
];

const mockResources = [
  { title: 'Full React Course 2024', category: 'Web Development', type: '🎥 YouTube Video', description: 'Learn React from scratch with project-based tutorials.', isFree: true, cta: 'Watch Free Course', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
  { title: 'FreeCodeCamp JS Algorithms', category: 'Programming', type: '💻 Free Practice', description: 'Master JS data structures and algorithms.', isFree: true, cta: 'Practice Now', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/' },
  { title: 'Git & GitHub Crash Course', category: 'Git & GitHub', type: '🎥 YouTube Video', description: 'Learn version control basics in 1 hour.', isFree: true, cta: 'Watch Free Course', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk' },
  { title: 'MDN Web Docs: HTML/CSS', category: 'Web Development', type: '🌐 Free Documentation', description: 'Comprehensive guide to core web technologies.', isFree: true, cta: 'Read Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
  { title: 'Effective Communication Skills', category: 'Soft Skills', type: '📄 Free Guide', description: 'Tips for workplace communication and presentations.', isFree: true, cta: 'Read Guide', url: 'https://www.coursera.org/learn/teamwork-skills-effective-communication' }
];

const mockInterviewPrep = [
  { 
    title: 'Technical Interview', icon: Code, iconColor: 'text-indigo-600', 
    desc: 'Algorithms, System Design, Live Coding', 
    isFree: true, 
    resourceList: ['🎥 Free Prep Video', '💻 Free Practice Set'], 
    cta: 'Start Preparation',
    url: 'https://leetcode.com/explore/interview/'
  },
  { 
    title: 'HR & Behavioral', icon: Briefcase, iconColor: 'text-emerald-600', 
    desc: 'Company Culture, STAR Method, Teamwork', 
    isFree: true, 
    resourceList: ['📄 Free Question Set', '🎥 Interview Examples'], 
    cta: 'Start Preparation',
    url: 'https://www.youtube.com/watch?v=1mHjMNZZvFo'
  },
  { 
    title: 'React Interview', icon: Terminal, iconColor: 'text-cyan-600', 
    desc: 'Hooks, State Management, Context API', 
    isFree: true, 
    resourceList: ['50 Practice Questions', '📄 Free Guide'], 
    cta: 'Start Preparation',
    url: 'https://github.com/sudheerj/reactjs-interview-questions'
  }
];

const mockSoftSkills = [
  { title: 'Professional Communication', icon: MessageSquare, iconColor: 'text-indigo-600', desc: 'Effective workplace and email communication', type: '🎥 Video Course', cta: 'Watch Free Course', url: 'https://www.youtube.com/results?search_query=effective+workplace+communication' },
  { title: 'Group Discussion', icon: Target, iconColor: 'text-amber-600', desc: 'Strategies and techniques for GD rounds', type: '📄 Free Guide', cta: 'Read Guide', url: 'https://www.indiabix.com/group-discussion/topics-with-answers/' },
  { title: 'Presentation Skills', icon: Zap, iconColor: 'text-emerald-600', desc: 'Public speaking and slide design', type: '💻 Free Practice', cta: 'Practice Now', url: 'https://www.toastmasters.org/resources/public-speaking-tips' },
  { title: 'HR Interview Prep', icon: Briefcase, iconColor: 'text-cyan-600', desc: 'Common HR questions and how to answer them', type: '🎥 YouTube Playlist', cta: 'Watch Playlist', url: 'https://www.youtube.com/results?search_query=hr+interview+questions+and+answers' }
];

const resumeChecklist = [
  { label: 'Personal Information', completed: true },
  { label: 'Education Details', completed: true },
  { label: 'Technical Skills', completed: true },
  { label: 'Projects with GitHub Links', completed: true },
  { label: 'Certifications', completed: false },
  { label: 'Achievements & Extracurriculars', completed: false }
];

const roadmapSteps = [
  'Learn Fundamentals',
  'Build Skills',
  'Practice',
  'Build Projects',
  'Prepare Resume',
  'Interview Preparation',
  'Internship Ready'
];

export const StudentCareerPrep: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="AI & Career Prep"
        description="Prepare for your internship and future career with personalized resources, interview practice, and skill tracking."
      />

      {/* A. Career Readiness Overview & G. Recommended Preparation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Career Readiness Overview" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex flex-col items-center justify-center text-center">
                <div className="text-4xl font-black text-indigo-700 mb-1">78%</div>
                <div className="text-sm font-semibold text-indigo-900">Overall Readiness</div>
                <p className="text-xs text-indigo-600 mt-1">You are on track!</p>
              </div>
              <div className="md:col-span-2 space-y-5 flex flex-col justify-center">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-slate-700">Skills Progress</span>
                    <span className="text-slate-900 font-bold">85%</span>
                  </div>
                  <ProgressBar progress={85} color="indigo" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-slate-700">Resume Readiness</span>
                    <span className="text-slate-900 font-bold">66%</span>
                  </div>
                  <ProgressBar progress={66} color="emerald" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-slate-700">Interview Readiness</span>
                    <span className="text-slate-900 font-bold">50%</span>
                  </div>
                  <ProgressBar progress={50} color="amber" />
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* G. Recommended Preparation */}
        <div className="lg:col-span-1">
          <Card title="Recommended for You" className="h-full bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="indigo" className="uppercase tracking-wider text-[10px]">Target Role</Badge>
              <span className="text-sm font-bold text-slate-800">Frontend Developer</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <Code className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Improve React Skills</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Focus on hooks and context API.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <Target className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Practice JavaScript</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Review closures, promises, and async/await.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <MessageSquare className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Frontend Interview Qs</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Practice system design for UI components.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* F. Career Roadmap */}
      <Card title="Career Roadmap">
        <div className="relative overflow-x-auto pb-4">
          <div className="flex items-center min-w-max pt-2 px-2">
            {roadmapSteps.map((step, index) => {
              // Mocking progress: first 4 steps complete, 5th in progress, rest pending
              let status: 'complete' | 'current' | 'pending' = 'pending';
              if (index < 4) status = 'complete';
              else if (index === 4) status = 'current';

              return (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 z-10 
                      ${status === 'complete' ? 'bg-indigo-600 border-indigo-600 text-white' : 
                        status === 'current' ? 'bg-white border-indigo-600 text-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.1)]' : 
                        'bg-slate-100 border-slate-200 text-slate-400'}`}
                    >
                      {status === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                    </div>
                    <div className="absolute top-12 whitespace-nowrap text-center w-24">
                      <span className={`text-xs font-semibold ${
                        status === 'complete' ? 'text-indigo-900' : 
                        status === 'current' ? 'text-indigo-600' : 'text-slate-400'
                      }`}>
                        {step}
                      </span>
                    </div>
                  </div>
                  
                  {index < roadmapSteps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 rounded-full ${
                      status === 'complete' ? 'bg-indigo-600' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-12" /> {/* Spacer for labels */}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* B. Skill Development */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Skill Development">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSkills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <div key={index} className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${skill.bg} ${skill.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{skill.name}</h4>
                        <span className="text-xs text-slate-500 font-medium">{skill.level}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-600">Progress</span>
                        <span className="text-slate-900">{skill.progress}%</span>
                      </div>
                      <ProgressBar progress={skill.progress} color="indigo" />
                      
                      {skill.isFree && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="emerald" className="text-[10px] uppercase font-bold py-0.5 px-1.5">🆓 Free Resource</Badge>
                          </div>
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">{skill.description}</p>
                          <div className="flex items-center text-xs text-slate-500 mb-3 font-medium">
                            {skill.resourceType === 'Video Course' || skill.resourceType === 'YouTube Playlist' ? <Video className="w-3.5 h-3.5 mr-1.5" /> : <BookOpen className="w-3.5 h-3.5 mr-1.5" />}
                            {skill.resourceType}
                          </div>
                        </div>
                      )}
                      
                      <div className={`mt-${skill.isFree ? '0' : '4'} flex justify-end`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-8 w-full sm:w-auto"
                          onClick={() => skill.url ? window.open(skill.url, '_blank', 'noopener,noreferrer') : undefined}
                        >
                          {skill.linkText || 'Continue Learning'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* D. Interview Preparation */}
          <Card title="Interview Preparation">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockInterviewPrep.map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center hover:border-indigo-200 transition-colors cursor-pointer group flex flex-col h-full">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 mb-3 flex-grow">{item.desc}</p>
                  
                  {item.isFree && (
                    <div className="bg-white rounded-lg p-2.5 mb-4 border border-slate-100 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-700">Resources</span>
                        <Badge variant="emerald" className="text-[9px] uppercase py-0 px-1.5">🆓 Free</Badge>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {item.resourceList.map((res, j) => (
                          <li key={j} className="flex items-center">
                            <span className="mr-1.5">{res.split(' ')[0]}</span>
                            <span className="truncate">{res.substring(res.indexOf(' ') + 1)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full text-xs mt-auto"
                    onClick={() => item.url ? window.open(item.url, '_blank', 'noopener,noreferrer') : undefined}
                  >
                    {item.cta}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* E. Communication & Soft Skills */}
          <Card title="Communication & Soft Skills">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockSoftSkills.map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition-colors cursor-pointer group flex flex-col h-full">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <Badge variant="emerald" className="text-[9px] uppercase py-0 px-1.5 mt-1">🆓 Free</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 flex-grow">{item.desc}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-medium text-slate-600">{item.type}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-[11px] text-indigo-600 hover:text-indigo-700 px-2"
                      onClick={() => item.url ? window.open(item.url, '_blank', 'noopener,noreferrer') : undefined}
                    >
                      {item.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          
          {/* E. Resume Preparation */}
          <Card title="Resume Readiness">
            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">4/6</h4>
                  <p className="text-xs text-slate-500 font-medium">Sections Completed</p>
                </div>
                <Badge variant={66 >= 100 ? 'emerald' : 'amber'}>
                  {66 >= 100 ? 'Ready' : 'In Progress'}
                </Badge>
              </div>
              <ProgressBar progress={66} color="emerald" />
            </div>
            
            <div className="space-y-2 mt-5">
              {resumeChecklist.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      item.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {item.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                    </div>
                    <span className={`text-sm ${item.completed ? 'text-slate-700' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </div>
                  {!item.completed && (
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Add</button>
                  )}
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => window.open('https://rxresu.me/', '_blank', 'noopener,noreferrer')}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Resume Builder
            </Button>
            
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-100">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-sm font-bold text-slate-900">ATS Resume Guide</h5>
                  <Badge variant="emerald" className="text-[10px] uppercase font-bold px-1.5 py-0.5">🆓 Free Resource</Badge>
                </div>
                <p className="text-xs text-slate-700 mb-3">Learn how to structure a resume for ATS screening, write project descriptions, and improve your LinkedIn profile.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white text-xs border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                  onClick={() => window.open('https://novoresume.com/career-blog/ats-resume', '_blank', 'noopener,noreferrer')}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Read Free Guide
                </Button>
              </div>
            </div>
          </Card>

          {/* C. Learning Resources */}
          <Card title="Learning Resources" className="h-fit">
            <div className="space-y-4">
              {mockResources.map((resource, i) => (
                <div key={i} className="flex flex-col border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start space-x-3 mb-2">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600 shrink-0 mt-0.5">
                      {resource.type.includes('Video') ? <Video className="w-4 h-4" /> : 
                       resource.type.includes('Practice') ? <Terminal className="w-4 h-4" /> : 
                       <BookOpen className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-slate-900 leading-tight hover:text-indigo-600 cursor-pointer">{resource.title}</h4>
                        {resource.isFree && <Badge variant="emerald" className="text-[9px] uppercase px-1.5 py-0 shrink-0 ml-2">🆓 Free</Badge>}
                      </div>
                      <div className="flex items-center mt-1 space-x-2 text-[11px] font-medium text-slate-500">
                        <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{resource.category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{resource.type}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-3 ml-11">{resource.description}</p>
                  <div className="ml-11">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[11px] h-7 px-3"
                      onClick={() => resource.url ? window.open(resource.url, '_blank', 'noopener,noreferrer') : undefined}
                    >
                      {resource.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-3 text-sm text-indigo-600 hover:text-indigo-700"
              onClick={() => window.open('https://www.freecodecamp.org/', '_blank', 'noopener,noreferrer')}
            >
              Browse All Resources
            </Button>
          </Card>

        </div>
      </div>
    </div>
  );
};
