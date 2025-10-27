import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string; // HH:mm format
  onChange: (time: string) => void;
  label?: string;
}

export const TimePicker = ({ value, onChange, label = "Time" }: TimePickerProps) => {
  // Parse current value or set defaults
  const [hours, minutes] = value ? value.split(':') : ['', ''];
  
  // Generate hours (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );
  
  // Generate minutes (00-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  const handleHourChange = (hour: string) => {
    const newMinutes = minutes || '00';
    onChange(`${hour}:${newMinutes}`);
  };

  const handleMinuteChange = (minute: string) => {
    const newHours = hours || '00';
    onChange(`${newHours}:${minute}`);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {label}
      </Label>
      <div className="grid grid-cols-2 gap-2">
        <Select value={hours} onValueChange={handleHourChange}>
          <SelectTrigger>
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {hourOptions.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={minutes} onValueChange={handleMinuteChange}>
          <SelectTrigger>
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {minuteOptions.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {minute}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};